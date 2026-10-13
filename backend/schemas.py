from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field

# Reading schemas
class ReadingCreate(BaseModel):
    device_id: str
    sample: str
    ph: float = Field(..., ge=0.0, le=14.0)
    tds: float = Field(..., ge=0.0, le=5000.0)
    turbidity: float = Field(..., ge=0.0, le=3000.0)
    temperature: Optional[float] = None

class ReadingResponse(BaseModel):
    id: int
    sample: str
    ph: float
    tds: float
    turbidity: float
    temperature: Optional[float] = None
    timestamp: datetime
    predicted_taste: str
    confidence: float
    device_id: str

    class Config:
        from_attributes = True

# Predict schemas
class PredictRequest(BaseModel):
    ph: float
    tds: float
    turbidity: float

class PredictResponse(BaseModel):
    taste: str
    confidence: float
    breakdown: Dict[str, float]

# Device Status
class DeviceStatusResponse(BaseModel):
    online: bool
    last_seen: Optional[datetime] = None
    device_id: Optional[str] = None
    rssi: Optional[int] = None

# Sample Summary
class SampleSummary(BaseModel):
    id: str
    name: str
    color: Optional[str] = None
    rasa: Optional[str] = None
    testCountToday: int
    lastReading: Optional[ReadingResponse] = None

# Alert schemas
class AlertResponse(BaseModel):
    id: str
    message: str
    severity: str
    sample: Optional[str] = None
    created_at: datetime
    read: bool

    class Config:
        from_attributes = True

# Test schemas (Kanban)
class TestCreate(BaseModel):
    sample: str
    name: str
    status: Optional[str] = "pending"
    predicted_taste: Optional[str] = None
    confidence: Optional[float] = None
    notes: Optional[str] = None

class TestUpdate(BaseModel):
    status: Optional[str] = None
    predicted_taste: Optional[str] = None
    confidence: Optional[float] = None
    notes: Optional[str] = None

class TestResponse(BaseModel):
    id: str
    sample: str
    name: str
    status: str
    predicted_taste: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True
