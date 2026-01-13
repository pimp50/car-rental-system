from datetime import datetime
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Car,
    CarCreate,
    CarPublic,
    CarUpdate,
    CarsPublic,
    Message,
)


router = APIRouter(prefix="/cars", tags=["cars"])


@router.get("/", response_model=CarsPublic)
def read_cars(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    model: str | None = None,
    plate_number: str | None = None,
    status: str | None = None,
) -> Any:
    """
    Retrieve cars.
    """
    _ = current_user
    statement = select(Car)
    if model:
        statement = statement.where(Car.model.contains(model))
    if plate_number:
        statement = statement.where(Car.plate_number.contains(plate_number))
    if status:
        statement = statement.where(Car.status == status)
    
    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()
    
    statement = statement.offset(skip).limit(limit)
    cars = session.exec(statement).all()
    return CarsPublic(data=cars, count=count)


@router.get("/{id}", response_model=CarPublic)
def read_car(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get car by ID.
    """
    _ = current_user
    car = session.get(Car, id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@router.post("/", response_model=CarPublic)
def create_car(*, session: SessionDep, current_user: CurrentUser, car_in: CarCreate) -> Any:
    """
    Create new car.
    """
    _ = current_user
    
    # Check if plate number already exists
    existing_car = session.exec(select(Car).where(Car.plate_number == car_in.plate_number)).first()
    if existing_car:
        raise HTTPException(
            status_code=400,
            detail=f"A car with plate number '{car_in.plate_number}' already exists."
        )

    car = Car.model_validate(car_in)
    
    # Set audit fields
    car.create_by = current_user.email  # Use email as username
    car.create_time = datetime.utcnow()
    car.update_time = datetime.utcnow()
    
    # Manually handle autoincrement for SQLite since it doesn't support it on non-PK columns easily
    # We find the max car_id and add 1
    # Note: This is not race-condition safe in high concurrency, but fine for this scale/SQLite
    try:
        max_id = session.exec(select(func.max(Car.car_id))).one()
        car.car_id = (max_id or 0) + 1
    except Exception:
        # Fallback or if table is empty
        car.car_id = 1
        
    session.add(car)
    session.commit()
    session.refresh(car)
    return car


@router.put("/{id}", response_model=CarPublic)
def update_car(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    car_in: CarUpdate,
) -> Any:
    """
    Update a car.
    """
    _ = current_user
    car = session.get(Car, id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
        
    # Check uniqueness of plate_number if it's being updated
    if car_in.plate_number and car_in.plate_number != car.plate_number:
        existing_car = session.exec(select(Car).where(Car.plate_number == car_in.plate_number)).first()
        if existing_car:
            raise HTTPException(
                status_code=400,
                detail=f"A car with plate number '{car_in.plate_number}' already exists."
            )
            
    update_dict = car_in.model_dump(exclude_unset=True)
    car.sqlmodel_update(update_dict)
    
    # Update audit fields
    car.update_time = datetime.utcnow()
    
    session.add(car)
    session.commit()
    session.refresh(car)
    return car


@router.delete("/{id}")
def delete_car(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a car.
    """
    _ = current_user
    car = session.get(Car, id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    session.delete(car)
    session.commit()
    return Message(message="Car deleted successfully")
