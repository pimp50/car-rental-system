
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Car,
    CarRental,
    CarRentalCreate,
    CarRentalPublic,
    CarRentalsPublic,
    CarRentalUpdate,
    Message,
)

router = APIRouter(prefix="/rentals", tags=["rentals"])


@router.get("/", response_model=CarRentalsPublic)
def read_rentals(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve rentals.
    """
    _ = current_user
    count_statement = select(func.count()).select_from(CarRental)
    count = session.exec(count_statement).one()
    statement = select(CarRental).offset(skip).limit(limit)
    rentals = session.exec(statement).all()
    return CarRentalsPublic(data=rentals, count=count)


@router.get("/{id}", response_model=CarRentalPublic)
def read_rental(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get rental by ID.
    """
    _ = current_user
    rental = session.get(CarRental, id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return rental


@router.post("/", response_model=CarRentalPublic)
def create_rental(
    *, session: SessionDep, current_user: CurrentUser, rental_in: CarRentalCreate
) -> Any:
    """
    Create new rental.
    """
    _ = current_user
    rental = CarRental.model_validate(rental_in)
    session.add(rental)
    
    # Update car status to 'rented'
    car = session.get(Car, rental_in.car_id)
    if car:
        car.status = "rented"
        session.add(car)
        
    session.commit()
    session.refresh(rental)
    return rental


@router.put("/{id}", response_model=CarRentalPublic)
def update_rental(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    rental_in: CarRentalUpdate,
) -> Any:
    """
    Update a rental.
    """
    _ = current_user
    rental = session.get(CarRental, id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    update_dict = rental_in.model_dump(exclude_unset=True)
    rental.sqlmodel_update(update_dict)
    session.add(rental)
    session.commit()
    session.refresh(rental)
    return rental


@router.delete("/{id}")
def delete_rental(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a rental.
    """
    _ = current_user
    rental = session.get(CarRental, id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
        
    # Optional: Should we set car status back to 'available' when rental is deleted?
    # Usually yes, or if the rental was active.
    # Let's check if it was active.
    if rental.status == "active":
        car = session.get(Car, rental.car_id)
        if car:
            car.status = "available"
            session.add(car)
            
    session.delete(rental)
    session.commit()
    return Message(message="Rental deleted successfully")
