import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Renter,
    RenterCreate,
    RenterPublic,
    RenterUpdate,
    RentersPublic,
)


router = APIRouter(prefix="/renters", tags=["renters"])


@router.get("/", response_model=RentersPublic)
def read_renters(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
) -> Any:
    statement = select(Renter)
    if search:
        statement = statement.where(
            (Renter.full_name.contains(search))
            | (Renter.email.contains(search))
            | (Renter.phone.contains(search))
            | (Renter.driver_license_number.contains(search))
        )
    
    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()
    
    statement = statement.offset(skip).limit(limit)
    renters = session.exec(statement).all()
    return RentersPublic(data=renters, count=count)


@router.get("/{id}", response_model=RenterPublic)
def read_renter(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    renter = session.get(Renter, id)
    if not renter:
        raise HTTPException(status_code=404, detail="Renter not found")
    return renter


@router.post("/", response_model=RenterPublic)
def create_renter(*, session: SessionDep, current_user: CurrentUser, renter_in: RenterCreate) -> Any:
    renter = Renter.model_validate(renter_in)
    session.add(renter)
    session.commit()
    session.refresh(renter)
    return renter


@router.put("/{id}", response_model=RenterPublic)
def update_renter(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    renter_in: RenterUpdate,
) -> Any:
    renter = session.get(Renter, id)
    if not renter:
        raise HTTPException(status_code=404, detail="Renter not found")
    update_dict = renter_in.model_dump(exclude_unset=True)
    renter.sqlmodel_update(update_dict)
    session.add(renter)
    session.commit()
    session.refresh(renter)
    return renter


@router.delete("/{id}")
def delete_renter(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    renter = session.get(Renter, id)
    if not renter:
        raise HTTPException(status_code=404, detail="Renter not found")
    session.delete(renter)
    session.commit()
    return Message(message="Renter deleted successfully")

