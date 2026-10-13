from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample = Column(String, index=True, nullable=False)
    ph = Column(Float, nullable=False)
    tds = Column(Float, nullable=False)
    turbidity = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    predicted_taste = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    device_id = Column(String, index=True, nullable=False)

class Test(Base):
    __tablename__ = "tests"

    id = Column(String, primary_key=True, index=True)
    sample = Column(String, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending | analyzing | verified | flagged
    predicted_taste = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(String, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    message = Column(String, nullable=False)
    severity = Column(String, default="info", nullable=False)  # warn | error | info
    sample = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    read = Column(Boolean, default=False, nullable=False)
