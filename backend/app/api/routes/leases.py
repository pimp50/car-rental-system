from datetime import datetime, date
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Body
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    LicensePlate,
    Message,
    Renter,
    PlateLease,
    PlateLeaseCreate,
    PlateLeasePublic,
    PlateLeaseUpdate,
    PlateLeasesPublic,
    PlatePayment,
    PlatePaymentPublic,
    PlatePaymentsPublic,
    get_ny_time,
)


router = APIRouter(prefix="/leases", tags=["leases"])


@router.get("/", response_model=PlateLeasesPublic)
def read_leases(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    plate_number: str | None = None,
    renter_name: str | None = None,
    status: str | None = None,
) -> Any:
    _ = current_user
    statement = select(PlateLease)
    if plate_number:
        statement = statement.join(
            LicensePlate, PlateLease.plate_id == LicensePlate.id
        ).where(LicensePlate.plate_number.contains(plate_number))
    if renter_name:
        statement = statement.join(Renter, PlateLease.renter_id == Renter.id).where(
            Renter.full_name.contains(renter_name)
        )
    if status:
        statement = statement.where(PlateLease.status == status)

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()
    
    statement = statement.offset(skip).limit(limit)
    leases = session.exec(statement).all()
    
    public_leases = []
    for lease in leases:
        public_lease = PlateLeasePublic.model_validate(lease)
        if lease.plate:
            public_lease.plate_number = lease.plate.plate_number
        if lease.renter:
            public_lease.renter_name = lease.renter.full_name
        public_leases.append(public_lease)
        
    return PlateLeasesPublic(data=public_leases, count=count)


@router.get("/{id}", response_model=PlateLeasePublic)
def read_lease(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
        
    public_lease = PlateLeasePublic.model_validate(lease)
    if lease.plate:
        public_lease.plate_number = lease.plate.plate_number
    if lease.renter:
        public_lease.renter_name = lease.renter.full_name
        
    return public_lease


@router.post("/", response_model=PlateLeasePublic)
def create_lease(*, session: SessionDep, current_user: CurrentUser, lease_in: PlateLeaseCreate) -> Any:
    _ = current_user
    active_statement = select(PlateLease).where(PlateLease.plate_id == lease_in.plate_id, PlateLease.status == "active")
    active = session.exec(active_statement).first()
    if active:
        raise HTTPException(status_code=400, detail="Plate already has an active lease")
        
    lease = PlateLease.model_validate(lease_in)
    
    # Set audit fields
    lease.create_by = current_user.email
    lease.create_time = get_ny_time()
    lease.update_time = get_ny_time()
    lease.payment_status = "unpaid"
    lease.paid_amount = 0.0
    lease.remaining_amount = lease.total_amount
    
    plate = session.get(LicensePlate, lease.plate_id)
    if not plate:
        raise HTTPException(status_code=404, detail="License plate not found")
        
    session.add(lease)
    plate.status = "rented"
    session.add(plate)
    session.commit()
    session.refresh(lease)
    
    public_lease = PlateLeasePublic.model_validate(lease)
    if lease.plate:
        public_lease.plate_number = lease.plate.plate_number
    if lease.renter:
        public_lease.renter_name = lease.renter.full_name
        
    return public_lease


@router.put("/{id}", response_model=PlateLeasePublic)
def update_lease(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    lease_in: PlateLeaseUpdate,
) -> Any:
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
        
    prev_status = lease.status
    update_dict = lease_in.model_dump(exclude_unset=True)
    lease.sqlmodel_update(update_dict)
    
    # Recalculate remaining if total_amount changed
    if lease_in.total_amount is not None:
        lease.remaining_amount = lease.total_amount - lease.paid_amount
        
    lease.update_time = get_ny_time()
    
    session.add(lease)
    if prev_status == "active" and lease.status != "active":
        plate = session.get(LicensePlate, lease.plate_id)
        if plate:
            plate.status = "available"
            session.add(plate)
            
    session.commit()
    session.refresh(lease)
    
    public_lease = PlateLeasePublic.model_validate(lease)
    if lease.plate:
        public_lease.plate_number = lease.plate.plate_number
    if lease.renter:
        public_lease.renter_name = lease.renter.full_name
        
    return public_lease


@router.post("/{id}/pay", response_model=PlateLeasePublic)
def pay_lease(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    amount: float = Body(..., embed=True),
    payment_date: date = Body(..., embed=True),
    note: str | None = Body(None, embed=True),
) -> Any:
    """
    Pay for a lease.
    """
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
        
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")
        
    remaining = lease.total_amount - lease.paid_amount
    if amount > remaining:
         raise HTTPException(status_code=400, detail=f"Payment amount cannot exceed remaining amount ({remaining})")
         
    # Create payment record
    payment = PlatePayment(
        lease_id=lease.id,
        amount=amount,
        payment_date=payment_date,
        note=note,
        create_by=current_user.email,
        create_time=get_ny_time()
    )
    session.add(payment)

    # Update lease aggregate info
    lease.paid_amount += amount
    lease.remaining_amount = lease.total_amount - lease.paid_amount
    lease.update_time = get_ny_time()
    
    # Precision fix
    if lease.remaining_amount < 0.01:
        lease.remaining_amount = 0.0
    
    if lease.paid_amount >= lease.total_amount - 0.01:
        lease.payment_status = "paid"
        lease.paid_amount = lease.total_amount
        lease.remaining_amount = 0.0
        
        # If fully paid, set plate status back to available?
        if lease.plate_id:
            plate = session.get(LicensePlate, lease.plate_id)
            if plate:
                plate.status = "available"
                session.add(plate)
        
    session.add(lease)
    session.commit()
    session.refresh(lease)
    
    public_lease = PlateLeasePublic.model_validate(lease)
    if lease.plate:
        public_lease.plate_number = lease.plate.plate_number
    if lease.renter:
        public_lease.renter_name = lease.renter.full_name
        
    return public_lease


@router.get("/{id}/payments", response_model=PlatePaymentsPublic)
def read_lease_payments(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get payments for a lease.
    """
    _ = current_user
    count_statement = select(func.count()).select_from(PlatePayment).where(PlatePayment.lease_id == id)
    count = session.exec(count_statement).one()
    
    statement = select(PlatePayment).where(PlatePayment.lease_id == id).order_by(PlatePayment.payment_date.desc(), PlatePayment.create_time.desc()).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    
    return PlatePaymentsPublic(data=payments, count=count)


@router.post("/{id}/freeze", response_model=PlateLeasePublic)
def freeze_lease(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Freeze a lease (cancel payment status, free the plate).
    """
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
        
    # Update lease status
    lease.payment_status = "cancel"
    lease.update_time = get_ny_time()
    
    # Free the plate
    if lease.plate_id:
        plate = session.get(LicensePlate, lease.plate_id)
        if plate:
            plate.status = "available"
            session.add(plate)
            
    session.add(lease)
    session.commit()
    session.refresh(lease)
    
    public_lease = PlateLeasePublic.model_validate(lease)
    if lease.plate:
        public_lease.plate_number = lease.plate.plate_number
    if lease.renter:
        public_lease.renter_name = lease.renter.full_name
        
    return public_lease


@router.delete("/{id}")
def delete_lease(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    session.delete(lease)
    plate = session.get(LicensePlate, lease.plate_id)
    if plate and plate.status == "rented":
        plate.status = "available"
        session.add(plate)
    session.commit()
    return Message(message="Lease deleted successfully")
