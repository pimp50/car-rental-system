import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    LicensePlate,
    LicensePlateCreate,
    LicensePlatePublic,
    LicensePlateUpdate,
    LicensePlatesPublic,
    Message,
    PlateLease,
)


router = APIRouter(prefix="/plates", tags=["plates"])


@router.get("/", response_model=LicensePlatesPublic)
def read_plates(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    plate_number: str | None = None,
    status: str | None = None,
) -> Any:
    _ = current_user
    statement = select(LicensePlate)
    if plate_number:
        statement = statement.where(LicensePlate.plate_number.contains(plate_number))
    if status:
        statement = statement.where(LicensePlate.status == status)
    
    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()
    
    statement = statement.offset(skip).limit(limit)
    plates = session.exec(statement).all()
    return LicensePlatesPublic(data=plates, count=count)


@router.get("/{id}", response_model=LicensePlatePublic)
def read_plate(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    _ = current_user
    plate = session.get(LicensePlate, id)
    if not plate:
        raise HTTPException(status_code=404, detail="License plate not found")
    return plate


@router.post("/", response_model=LicensePlatePublic)
def create_license_plate(*, session: SessionDep, current_user: CurrentUser, plate_in: LicensePlateCreate) -> Any:
    _ = current_user
    plate = LicensePlate.model_validate(plate_in)
    session.add(plate)
    session.commit()
    session.refresh(plate)
    return plate


@router.put("/{id}", response_model=LicensePlatePublic)
def update_license_plate(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    plate_in: LicensePlateUpdate,
) -> Any:
    _ = current_user
    plate = session.get(LicensePlate, id)
    if not plate:
        raise HTTPException(status_code=404, detail="License plate not found")
        
    # Check if status is being updated
    if plate_in.status and plate_in.status != plate.status:
        # Check for unpaid leases
        unpaid_leases = session.exec(
            select(PlateLease).where(
                PlateLease.plate_id == id,
                PlateLease.payment_status == "unpaid"
            )
        ).first()
        
        if unpaid_leases:
            raise HTTPException(
                status_code=400, 
                detail="Cannot update plate status: Plate has unpaid rentals"
            )
            
    update_dict = plate_in.model_dump(exclude_unset=True)
    plate.sqlmodel_update(update_dict)
    session.add(plate)
    session.commit()
    session.refresh(plate)
    return plate


@router.delete("/{id}")
def delete_license_plate(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    _ = current_user
    plate = session.get(LicensePlate, id)
    if not plate:
        raise HTTPException(status_code=404, detail="License plate not found")
        
    # Check for unpaid leases
    unpaid_leases = session.exec(
        select(PlateLease).where(
            PlateLease.plate_id == id,
            PlateLease.payment_status == "unpaid"
        )
    ).first()
    
    if unpaid_leases:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete plate: Plate has unpaid rentals"
        )
        
    session.delete(plate)
    session.commit()
    return Message(message="License plate deleted successfully")
