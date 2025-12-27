import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
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
    return PlateLeasesPublic(data=leases, count=count)


@router.get("/{id}", response_model=PlateLeasePublic)
def read_lease(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    _ = current_user
    lease = session.get(PlateLease, id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    return lease


@router.post("/", response_model=PlateLeasePublic)
def create_lease(*, session: SessionDep, current_user: CurrentUser, lease_in: PlateLeaseCreate) -> Any:
    _ = current_user
    active_statement = select(PlateLease).where(PlateLease.plate_id == lease_in.plate_id, PlateLease.status == "active")
    active = session.exec(active_statement).first()
    if active:
        raise HTTPException(status_code=400, detail="Plate already has an active lease")
    lease = PlateLease.model_validate(lease_in)
    plate = session.get(LicensePlate, lease.plate_id)
    if not plate:
        raise HTTPException(status_code=404, detail="License plate not found")
    session.add(lease)
    plate.status = "rented"
    session.add(plate)
    session.commit()
    session.refresh(lease)
    return lease


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
    session.add(lease)
    if prev_status == "active" and lease.status != "active":
        plate = session.get(LicensePlate, lease.plate_id)
        if plate:
            plate.status = "available"
            session.add(plate)
    session.commit()
    session.refresh(lease)
    return lease


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
