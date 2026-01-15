import uuid
from datetime import date, datetime
from zoneinfo import ZoneInfo

from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import CHAR, TypeDecorator
from sqlmodel import Field, Relationship, SQLModel

from pydantic import EmailStr

def get_ny_time():
    """Get current time in New York timezone as naive datetime (local time)"""
    return datetime.now(ZoneInfo("America/New_York")).replace(tzinfo=None)

class UUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        # PostgreSQL用原生UUID，SQLite转为CHAR(36)字符串存储
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        # 存入数据库时：UUID对象转字符串
        if value is None:
            return value
        return str(value) if isinstance(value, uuid.UUID) else value

    def process_result_value(self, value, dialect):
        # 从数据库读取时：字符串转回UUID对象
        if value is None:
            return value
        try:
            return uuid.UUID(value)
        except ValueError:
            return value



# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True,sa_type=UUID())
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True,sa_type=UUID())
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE",sa_type=UUID()
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class RenterBase(SQLModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=7, max_length=20)
    email: EmailStr | None = Field(default=None, max_length=255)
    driver_license_number: str = Field(min_length=4, max_length=64)
    driver_license_state: str = Field(default="NY", max_length=2)
    address: str | None = Field(default=None, max_length=255)


class RenterCreate(RenterBase):
    pass


class RenterUpdate(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = Field(default=None, max_length=255)
    driver_license_number: str | None = Field(default=None, max_length=64)
    driver_license_state: str | None = Field(default=None, max_length=2)
    address: str | None = Field(default=None, max_length=255)


class Renter(RenterBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    leases: list["PlateLease"] = Relationship(back_populates="renter", cascade_delete=True)
    car_rentals: list["CarRental"] = Relationship(back_populates="renter", cascade_delete=True)


class RenterPublic(RenterBase):
    id: uuid.UUID


class RentersPublic(SQLModel):
    data: list[RenterPublic]
    count: int


class LicensePlateBase(SQLModel):
    plate_number: str = Field(unique=True, index=True, min_length=2, max_length=16)
    plate_state: str = Field(default="NY", max_length=2)
    purchase_date: date
    purchase_amount: float
    status: str = Field(default="available", max_length=32)
    notes: str | None = Field(default=None, max_length=255)


class LicensePlateCreate(LicensePlateBase):
    pass


class LicensePlateUpdate(SQLModel):
    plate_number: str | None = Field(default=None, max_length=16)
    plate_state: str | None = Field(default=None, max_length=2)
    purchase_date: date | None = None
    purchase_amount: float | None = None
    status: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=255)


class LicensePlate(LicensePlateBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    leases: list["PlateLease"] = Relationship(back_populates="plate", cascade_delete=True)


class LicensePlatePublic(LicensePlateBase):
    id: uuid.UUID


class LicensePlatesPublic(SQLModel):
    data: list[LicensePlatePublic]
    count: int


class PlateLeaseBase(SQLModel):
    start_date: date
    end_date: date | None = None
    total_amount: float = Field(default=0.0)
    frequency: str = Field(default="monthly", max_length=16)
    status: str = Field(default="active", max_length=32)
    payment_status: str = Field(default="unpaid", max_length=16) # paid, unpaid, cancel
    paid_amount: float = Field(default=0.0)
    remaining_amount: float = Field(default=0.0)
    rental_type: str = Field(default="lease", max_length=32) # lease
    create_by: str | None = Field(default=None, max_length=255)
    create_time: datetime | None = Field(default_factory=get_ny_time)
    update_time: datetime | None = Field(default_factory=get_ny_time, sa_column_kwargs={"onupdate": get_ny_time})


class PlateLeaseCreate(PlateLeaseBase):
    plate_id: uuid.UUID
    renter_id: uuid.UUID
    total_amount: float # Override to make required


class PlateLeaseUpdate(SQLModel):
    start_date: date | None = None
    end_date: date | None = None
    total_amount: float | None = None
    frequency: str | None = Field(default=None, max_length=16)
    status: str | None = Field(default=None, max_length=32)
    payment_status: str | None = None
    paid_amount: float | None = None
    remaining_amount: float | None = None
    rental_type: str | None = None


class PlatePaymentBase(SQLModel):
    amount: float
    payment_date: date
    note: str | None = None
    create_by: str | None = Field(default=None, max_length=255)
    create_time: datetime | None = Field(default_factory=get_ny_time)


class PlatePayment(PlatePaymentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    lease_id: uuid.UUID = Field(foreign_key="platelease.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    lease: "PlateLease" = Relationship(back_populates="payments")


class PlatePaymentPublic(PlatePaymentBase):
    id: uuid.UUID
    lease_id: uuid.UUID


class PlatePaymentsPublic(SQLModel):
    data: list[PlatePaymentPublic]
    count: int


class PlateLease(PlateLeaseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    plate_id: uuid.UUID = Field(foreign_key="licenseplate.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    renter_id: uuid.UUID = Field(foreign_key="renter.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    plate: LicensePlate | None = Relationship(back_populates="leases")
    renter: Renter | None = Relationship(back_populates="leases")
    payments: list["PlatePayment"] = Relationship(back_populates="lease", cascade_delete=True)


class PlateLeasePublic(PlateLeaseBase):
    id: uuid.UUID
    plate_id: uuid.UUID
    renter_id: uuid.UUID
    plate_number: str | None = None
    renter_name: str | None = None


class PlateLeasesPublic(SQLModel):
    data: list[PlateLeasePublic]
    count: int


# Car Models
class CarBase(SQLModel):
    model: str = Field(min_length=1, max_length=255)
    wav: int = Field(default=0) # 0 or 1
    marker: str | None = Field(default="premium", max_length=64)
    color: str | None = Field(default=None, max_length=64)
    year: int
    vin_number: str | None = Field(default=None, max_length=64)
    plate_number: str | None = Field(default=None, unique=True, index=True, max_length=16)
    state: str = Field(default="NY", max_length=2)
    registration_expires_at: datetime | None = None
    insurance_expires_at: datetime | None = None
    price: float | None = None
    installation_fee_for_safety_equipment: float | None = None
    insurance_expenses: float | None = None
    service_expenses: float | None = None
    maintenance_costs: float | None = None
    full_coverage_auto_insurance: float | None = None
    other_expenses: float | None = None
    status: str = Field(default="available", max_length=32)
    notes: str | None = Field(default=None, max_length=255)

class CarCreate(CarBase):
    car_id: int | None = None

class CarUpdate(SQLModel):
    model: str | None = Field(default=None, min_length=1, max_length=255)
    wav: int | None = None
    marker: str | None = Field(default=None, max_length=64)
    color: str | None = Field(default=None, max_length=64)
    year: int | None = None
    vin_number: str | None = Field(default=None, max_length=64)
    plate_number: str | None = Field(default=None, min_length=1, max_length=16)
    state: str | None = Field(default=None, max_length=2)
    registration_expires_at: datetime | None = None
    insurance_expires_at: datetime | None = None
    price: float | None = None
    installation_fee_for_safety_equipment: float | None = None
    insurance_expenses: float | None = None
    service_expenses: float | None = None
    maintenance_costs: float | None = None
    full_coverage_auto_insurance: float | None = None
    other_expenses: float | None = None
    status: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=255)

class Car(CarBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    car_id: int | None = Field(default=None, primary_key=False, sa_column_kwargs={"autoincrement": True, "unique": True})
    create_by: str | None = Field(default=None, max_length=255)
    create_time: datetime | None = Field(default_factory=get_ny_time)
    update_time: datetime | None = Field(default_factory=get_ny_time, sa_column_kwargs={"onupdate": get_ny_time})
    rentals: list["CarRental"] = Relationship(back_populates="car", cascade_delete=True)

class CarPublic(CarBase):
    id: uuid.UUID
    car_id: int | None
    create_by: str | None
    create_time: datetime | None
    update_time: datetime | None

class CarsPublic(SQLModel):
    data: list[CarPublic]
    count: int

class CarRentalBase(SQLModel):
    start_date: date
    end_date: date | None = None
    total_amount: float = Field(default=0.0)
    frequency: str = Field(default="monthly", max_length=16)
    status: str = Field(default="active", max_length=32)
    payment_status: str = Field(default="unpaid", max_length=16) # paid, unpaid
    paid_amount: float = Field(default=0.0)
    remaining_amount: float = Field(default=0.0)
    rental_type: str = Field(default="lease", max_length=32) # lease, lease_to_own
    create_by: str | None = Field(default=None, max_length=255)
    create_time: datetime | None = Field(default_factory=get_ny_time)
    update_time: datetime | None = Field(default_factory=get_ny_time, sa_column_kwargs={"onupdate": get_ny_time})

class CarRentalCreate(SQLModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    start_date: date
    end_date: date | None = None
    total_amount: float
    frequency: str = "monthly"
    rental_type: str = "lease"

class CarRentalUpdate(SQLModel):
    start_date: date | None = None
    end_date: date | None = None
    total_amount: float | None = None
    frequency: str | None = None
    status: str | None = None
    payment_status: str | None = None
    paid_amount: float | None = None
    remaining_amount: float | None = None
    rental_type: str | None = None

class CarRental(CarRentalBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    car_id: uuid.UUID = Field(foreign_key="car.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    renter_id: uuid.UUID = Field(foreign_key="renter.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    car: Car | None = Relationship(back_populates="rentals")
    renter: Renter | None = Relationship(back_populates="car_rentals")
    payments: list["RentalPayment"] = Relationship(back_populates="rental", cascade_delete=True)

class CarRentalPublic(CarRentalBase):
    id: uuid.UUID
    car_id: uuid.UUID
    renter_id: uuid.UUID
    car_model: str | None = None
    car_short_id: int | None = None
    renter_name: str | None = None


class RentalPaymentBase(SQLModel):
    amount: float
    payment_date: date = Field(default_factory=date.today)
    note: str | None = Field(default=None, max_length=255)


class RentalPayment(RentalPaymentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, sa_type=UUID())
    rental_id: uuid.UUID = Field(foreign_key="carrental.id", nullable=False, ondelete="CASCADE", sa_type=UUID())
    rental: CarRental = Relationship(back_populates="payments")
    create_by: str | None = Field(default=None, max_length=255)
    create_time: datetime | None = Field(default_factory=get_ny_time)


class RentalPaymentPublic(RentalPaymentBase):
    id: uuid.UUID
    rental_id: uuid.UUID
    create_by: str | None
    create_time: datetime | None


class RentalPaymentsPublic(SQLModel):
    data: list[RentalPaymentPublic]
    count: int



class CarRentalsPublic(SQLModel):
    data: list[CarRentalPublic]
    count: int
