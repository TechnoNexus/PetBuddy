"""
SQLAlchemy ORM models for PetBuddy.
Maps to tables in the Supabase PostgreSQL database.
"""
import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    DateTime, ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    shelter = "shelter"
    moderator = "moderator"


class PetStatus(str, enum.Enum):
    available = "available"
    pending = "pending"
    adopted = "adopted"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    contacted = "contacted"
    approved = "approved"
    rejected = "rejected"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


def _utcnow():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    """
    Application user profile.
    Table named 'app_users' to avoid collision with Supabase's auth.users.
    Linked to Supabase Auth via supabase_auth_id.
    """
    __tablename__ = "app_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_auth_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.user.value)
    status = Column(String, default="active")
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    pet_preferences = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    pets = relationship("Pet", back_populates="owner", lazy="dynamic")
    adoption_applications = relationship(
        "AdoptionApplication",
        back_populates="applicant",
        foreign_keys="AdoptionApplication.applicant_id",
        lazy="dynamic",
    )
    orders = relationship("Order", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.email}>"


class Pet(Base):
    """A pet listing available for adoption."""
    __tablename__ = "pets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    weight = Column(Float, nullable=True)
    color = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    health_info = Column(Text, nullable=True)
    vaccinated = Column(Boolean, default=False)
    neutered = Column(Boolean, default=False)
    trained = Column(Boolean, default=False)
    adoption_fee = Column(Float, nullable=True)
    status = Column(String, default=PetStatus.available.value)
    location = Column(String, nullable=True)
    owner_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True
    )
    external_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    owner = relationship("User", back_populates="pets")
    photos = relationship(
        "PetPhoto", back_populates="pet", cascade="all, delete-orphan", lazy="selectin"
    )
    applications = relationship("AdoptionApplication", back_populates="pet", lazy="dynamic")

    def __repr__(self):
        return f"<Pet {self.name} ({self.species})>"


class PetPhoto(Base):
    """Photo associated with a pet listing."""
    __tablename__ = "pet_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(
        UUID(as_uuid=True),
        ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
    )
    url = Column(String, nullable=False)
    storage_path = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    # Relationships
    pet = relationship("Pet", back_populates="photos")

    def __repr__(self):
        return f"<PetPhoto pet_id={self.pet_id}>"


class AdoptionApplication(Base):
    """An adoption application submitted by a user for a pet."""
    __tablename__ = "adoption_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=True)
    applicant_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True
    )
    status = Column(String, default=ApplicationStatus.pending.value)

    # Applicant info (denormalized for when applicant_id is null / guest)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    has_other_pets = Column(Boolean, default=False)
    other_pets_details = Column(Text, nullable=True)
    housing_type = Column(String, nullable=True)
    agreed_to_terms = Column(Boolean, default=False)

    # For external pets (AI-found) not in our DB
    pet_name = Column(String, nullable=True)
    pet_source = Column(String, default="internal")  # "internal" or "external"
    external_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    pet = relationship("Pet", back_populates="applications")
    applicant = relationship(
        "User",
        back_populates="adoption_applications",
        foreign_keys=[applicant_id],
    )

    def __repr__(self):
        return f"<AdoptionApplication {self.full_name} → {self.pet_name or self.pet_id}>"


class Product(Base):
    """A product in the PetBuddy store."""
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    def __repr__(self):
        return f"<Product {self.name} ${self.price}>"


class Order(Base):
    """A completed or pending store order."""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    status = Column(String, default=OrderStatus.pending.value)
    total = Column(Float, nullable=False)
    stripe_session_id = Column(String, nullable=True)
    shipping_address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self):
        return f"<Order {self.id} ${self.total}>"


class OrderItem(Base):
    """A single line item within an order."""
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id = Column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Snapshot of price at purchase time

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    def __repr__(self):
        return f"<OrderItem {self.product_id} x{self.quantity}>"
