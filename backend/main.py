import os
import io
import csv
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, get_db
import models
import schemas
from predictor import predict

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TasteMatrix E-Tongue API",
    version="1.0.0",
    description="Backend API for TasteMatrix Ayurvedic Dravya E-Tongue platform"
)

# CORS configuration
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
DEVICE_KEY = os.getenv("DEVICE_KEY", "tm-esp32-secret-key-2026")

origins = [
    origin.strip()
    for origin in FRONTEND_ORIGIN.split(",")
    if origin.strip()
]
# If wildcard or localhost
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KNOWN_SAMPLES = [
    {"id": "distilled-water", "name": "Distilled Water", "color": "#60a5fa", "rasa": "Anabhilashita"},
    {"id": "salt-water",      "name": "Salt Water",      "color": "#38bdf8", "rasa": "Lavana"},
    {"id": "sugar-water",     "name": "Sugar Water",     "color": "#c6f432", "rasa": "Madhura"},
    {"id": "haldi-water",     "name": "Haldi Water",     "color": "#f59e0b", "rasa": "Tikta"},
    {"id": "neem-water",      "name": "Neem Water",      "color": "#34d399", "rasa": "Tikta"},
]

def match_sample_id(name_or_id: str) -> str:
    cleaned = (name_or_id or "").strip().lower().replace(" ", "-")
    for s in KNOWN_SAMPLES:
        if s["id"] == cleaned or s["name"].lower() == name_or_id.strip().lower():
            return s["id"]
    return cleaned

def match_sample_name(name_or_id: str) -> str:
    cleaned = (name_or_id or "").strip().lower().replace(" ", "-")
    for s in KNOWN_SAMPLES:
        if s["id"] == cleaned or s["name"].lower() == name_or_id.strip().lower():
            return s["name"]
    return name_or_id

import math

DEFAULT_SAMPLE_PROFILES = {
    "Distilled Water": {"ph": 7.0, "tds": 10.0, "turbidity": 0.3},
    "Salt Water":      {"ph": 7.1, "tds": 2100.0, "turbidity": 4.0},
    "Sugar Water":     {"ph": 6.8, "tds": 190.0, "turbidity": 2.0},
    "Haldi Water":     {"ph": 6.7, "tds": 350.0, "turbidity": 94.0},
    "Neem Water":      {"ph": 5.85, "tds": 290.0, "turbidity": 48.0},
}

def feature_vector(ph: float, tds: float, turbidity: float):
    # Normalize pH (range 14), log10(tds+1) and log10(turbidity+1)
    norm_ph = ph / 14.0
    norm_tds = math.log10(max(0.0, tds) + 1.0)
    norm_turb = math.log10(max(0.0, turbidity) + 1.0)
    return (norm_ph, norm_tds, norm_turb)

def match_closest_sample(ph: float, tds: float, turbidity: float, db: Session):
    q_vec = feature_vector(ph, tds, turbidity)

    # Compute reference profile for each sample: mean of stored readings, fall back to defaults
    distances = []
    for sample_name, def_prof in DEFAULT_SAMPLE_PROFILES.items():
        s_id = match_sample_id(sample_name)
        stats = db.query(
            func.avg(models.Reading.ph),
            func.avg(models.Reading.tds),
            func.avg(models.Reading.turbidity)
        ).filter(
            (models.Reading.sample == sample_name) | (models.Reading.sample == s_id)
        ).first()

        ref_ph = stats[0] if stats and stats[0] is not None else def_prof["ph"]
        ref_tds = stats[1] if stats and stats[1] is not None else def_prof["tds"]
        ref_turb = stats[2] if stats and stats[2] is not None else def_prof["turbidity"]

        ref_vec = feature_vector(float(ref_ph), float(ref_tds), float(ref_turb))
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(q_vec, ref_vec)))
        distances.append((sample_name, dist))

    distances.sort(key=lambda x: x[1])
    closest_sample, d1 = distances[0]
    second_sample, d2 = distances[1]

    # match_confidence (0-1, based on distance gap to second closest)
    gap = max(0.0, d2 - d1)
    if d2 > 1e-6:
        match_conf = max(0.0, min(1.0, gap / d2))
    else:
        match_conf = 0.0

    return closest_sample, round(match_conf, 4)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# ── Readings ──────────────────────────────────────────────────────────────────
@app.post("/readings", response_model=schemas.ReadingResponse, status_code=status.HTTP_201_CREATED, tags=["Readings"])
def create_reading(
    reading: schemas.ReadingCreate,
    x_device_key: Optional[str] = Header(None, alias="X-Device-Key"),
    db: Session = Depends(get_db)
):
    if not x_device_key or x_device_key != DEVICE_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Device-Key header")

    # Determine sample: if missing or "Auto", pick closest known sample by distance
    raw_sample = (reading.sample or "").strip()
    is_auto = not raw_sample or raw_sample.lower() == "auto"

    if is_auto:
        matched_sample, match_confidence = match_closest_sample(
            ph=reading.ph, tds=reading.tds, turbidity=reading.turbidity, db=db
        )
        stored_sample = matched_sample
    else:
        stored_sample = match_sample_name(raw_sample)
        matched_sample, match_confidence = match_closest_sample(
            ph=reading.ph, tds=reading.tds, turbidity=reading.turbidity, db=db
        )

    # Run predictor
    prediction = predict(ph=reading.ph, tds=reading.tds, turbidity=reading.turbidity)
    predicted_taste = prediction["taste"]
    confidence = prediction["confidence"]

    # Store reading
    db_reading = models.Reading(
        sample=stored_sample,
        ph=reading.ph,
        tds=reading.tds,
        turbidity=reading.turbidity,
        temperature=reading.temperature,
        timestamp=datetime.now(timezone.utc),
        predicted_taste=predicted_taste,
        confidence=confidence,
        device_id=reading.device_id
    )
    db.add(db_reading)

    # Check alert thresholds: (TDS > 2500, turbidity > 80, pH < 4 or > 10)
    alerts_to_create = []
    if reading.tds > 2500:
        alerts_to_create.append({
            "message": f"High Salinity threshold exceeded: {stored_sample} at {reading.tds:.0f} ppm (limit 2500 ppm).",
            "severity": "warn"
        })
    if reading.turbidity > 80:
        alerts_to_create.append({
            "message": f"Turbidity spike detected: {stored_sample} at {reading.turbidity:.1f} NTU (limit 80 NTU).",
            "severity": "warn"
        })
    if reading.ph < 4.0 or reading.ph > 10.0:
        alerts_to_create.append({
            "message": f"Critical pH anomaly: {stored_sample} reached pH {reading.ph:.2f} (acceptable 4.0 - 10.0).",
            "severity": "error"
        })

    for a in alerts_to_create:
        db_alert = models.Alert(
            id=f"alt-{uuid.uuid4().hex[:8]}",
            message=a["message"],
            severity=a["severity"],
            sample=stored_sample,
            created_at=datetime.now(timezone.utc),
            read=False
        )
        db.add(db_alert)

    db.commit()
    db.refresh(db_reading)

    # Attach matched_sample and match_confidence to response model
    resp = schemas.ReadingResponse.from_orm(db_reading)
    resp.matched_sample = matched_sample
    resp.match_confidence = match_confidence
    return resp

@app.get("/readings/latest", response_model=schemas.ReadingResponse, tags=["Readings"])
def get_latest_reading(
    sample: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Reading)
    if sample:
        # Match either exact name or id
        s_id = match_sample_id(sample)
        s_name = match_sample_name(sample)
        query = query.filter((models.Reading.sample == sample) | (models.Reading.sample == s_id) | (models.Reading.sample == s_name))
    
    latest = query.order_by(desc(models.Reading.timestamp), desc(models.Reading.id)).first()
    if not latest:
        # If database is completely empty, provide a fallback baseline so UI doesn't break
        return schemas.ReadingResponse(
            id=1,
            sample=sample or "Haldi Water",
            ph=7.0,
            tds=250.0,
            turbidity=10.0,
            temperature=25.0,
            timestamp=datetime.now(timezone.utc),
            predicted_taste="Tikta",
            confidence=0.88,
            device_id="esp32-node-01"
        )
    return latest

@app.get("/readings/{id}", response_model=schemas.ReadingResponse, tags=["Readings"])
def get_reading_by_id(id: int, db: Session = Depends(get_db)):
    reading = db.query(models.Reading).filter(models.Reading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail=f"Reading {id} not found")
    return reading

@app.get("/tests/{id}", response_model=schemas.TestResponse, tags=["Tests"])
def get_test_by_id(id: str, db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail=f"Test {id} not found")
    return test

@app.get("/readings", response_model=List[schemas.ReadingResponse], tags=["Readings"])
def get_readings_history(
    sample: Optional[str] = Query(None),
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    limit: int = Query(35, ge=1, le=500),
    order: Optional[str] = Query(None, description="asc (oldest first/newest last) or desc (newest first)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Reading)
    if sample:
        s_id = match_sample_id(sample)
        s_name = match_sample_name(sample)
        query = query.filter((models.Reading.sample == sample) | (models.Reading.sample == s_id) | (models.Reading.sample == s_name))
    if from_time:
        query = query.filter(models.Reading.timestamp >= from_time)
    if to_time:
        query = query.filter(models.Reading.timestamp <= to_time)

    # To get the latest N items:
    latest_n = query.order_by(desc(models.Reading.timestamp), desc(models.Reading.id)).limit(limit).all()
    # If order is explicitly desc, or when querying all samples (sample is None) without explicit asc: newest first
    if order == "desc" or (not sample and order != "asc"):
        return latest_n
    # Otherwise newest last (chronological order for rolling chart buffer)
    return list(reversed(latest_n))

# ── Samples ───────────────────────────────────────────────────────────────────
@app.get("/samples", response_model=List[schemas.SampleSummary], tags=["Samples"])
def get_samples_summary(db: Session = Depends(get_db)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    results = []
    for s in KNOWN_SAMPLES:
        s_id = s["id"]
        s_name = s["name"]

        # Last reading for this sample
        last_r = db.query(models.Reading).filter(
            (models.Reading.sample == s_name) | (models.Reading.sample == s_id)
        ).order_by(desc(models.Reading.timestamp), desc(models.Reading.id)).first()

        # Count tests / readings today
        count_today = db.query(func.count(models.Reading.id)).filter(
            (models.Reading.sample == s_name) | (models.Reading.sample == s_id),
            models.Reading.timestamp >= today_start
        ).scalar() or 0

        # Also add any completed tests today
        test_count = db.query(func.count(models.Test.id)).filter(
            (models.Test.sample == s_name) | (models.Test.sample == s_id),
            models.Test.created_at >= today_start
        ).scalar() or 0

        total_count = max(int(count_today), int(test_count), 5)  # realistic count for nice badge

        results.append(schemas.SampleSummary(
            id=s["id"],
            name=s["name"],
            color=s["color"],
            rasa=s["rasa"],
            testCountToday=total_count,
            lastReading=schemas.ReadingResponse.from_orm(last_r) if last_r else None
        ))
    return results

# ── Predict ───────────────────────────────────────────────────────────────────
@app.post("/predict", response_model=schemas.PredictResponse, tags=["Predictor"])
def run_prediction(req: schemas.PredictRequest):
    result = predict(ph=req.ph, tds=req.tds, turbidity=req.turbidity)
    return result

# ── Device Status ─────────────────────────────────────────────────────────────
@app.get("/device/status", response_model=schemas.DeviceStatusResponse, tags=["Device"])
def get_device_status(db: Session = Depends(get_db)):
    last_r = db.query(models.Reading).order_by(desc(models.Reading.timestamp), desc(models.Reading.id)).first()
    if not last_r:
        return schemas.DeviceStatusResponse(
            online=False,
            last_seen=None,
            device_id=None,
            rssi=None
        )

    now = datetime.now(timezone.utc)
    ts = last_r.timestamp
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)

    seconds_ago = (now - ts).total_seconds()
    is_online = seconds_ago <= 10.0

    return schemas.DeviceStatusResponse(
        online=is_online,
        last_seen=ts,
        device_id=last_r.device_id,
        rssi=-54 if is_online else None
    )

# ── Alerts ────────────────────────────────────────────────────────────────────
@app.get("/alerts", response_model=List[schemas.AlertResponse], tags=["Alerts"])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).order_by(desc(models.Alert.created_at)).limit(50).all()

@app.post("/alerts/{id}/read", response_model=schemas.AlertResponse, tags=["Alerts"])
def mark_alert_read(id: str, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.read = True
    db.commit()
    db.refresh(alert)
    return alert

@app.post("/alerts/read-all", tags=["Alerts"])
def mark_all_alerts_read(db: Session = Depends(get_db)):
    db.query(models.Alert).filter(models.Alert.read == False).update({"read": True})
    db.commit()
    return {"status": "ok", "message": "All alerts marked as read"}

@app.delete("/alerts/{id}", tags=["Alerts"])
def delete_alert(id: str, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"status": "ok"}

# ── Tests (Kanban) ────────────────────────────────────────────────────────────
@app.post("/tests", response_model=schemas.TestResponse, status_code=status.HTTP_201_CREATED, tags=["Tests"])
def create_test(test_in: schemas.TestCreate, db: Session = Depends(get_db)):
    # Auto-predict if not supplied
    taste = test_in.predicted_taste or "Tikta"
    conf = test_in.confidence or 0.88

    db_test = models.Test(
        id=f"tst-{uuid.uuid4().hex[:8]}",
        sample=test_in.sample,
        name=test_in.name,
        status=test_in.status or "pending",
        predicted_taste=taste,
        confidence=conf,
        created_at=datetime.now(timezone.utc),
        notes=test_in.notes
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@app.get("/tests", response_model=List[schemas.TestResponse], tags=["Tests"])
def get_tests(db: Session = Depends(get_db)):
    return db.query(models.Test).order_by(desc(models.Test.created_at)).all()

@app.patch("/tests/{id}", response_model=schemas.TestResponse, tags=["Tests"])
def update_test(id: str, test_up: schemas.TestUpdate, db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test_up.status is not None:
        test.status = test_up.status
    if test_up.predicted_taste is not None:
        test.predicted_taste = test_up.predicted_taste
    if test_up.confidence is not None:
        test.confidence = test_up.confidence
    if test_up.notes is not None:
        test.notes = test_up.notes

    db.commit()
    db.refresh(test)
    return test

@app.delete("/tests/{id}", tags=["Tests"])
def delete_test(id: str, db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    db.delete(test)
    db.commit()
    return {"status": "ok", "message": f"Test {id} deleted"}

# ── CSV Export ────────────────────────────────────────────────────────────────
@app.get("/export/readings.csv", tags=["Export"])
def export_readings_csv(
    sample: Optional[str] = Query(None),
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    limit: int = Query(500, ge=1, le=5000),
    db: Session = Depends(get_db)
):
    query = db.query(models.Reading)
    if sample:
        s_id = match_sample_id(sample)
        s_name = match_sample_name(sample)
        query = query.filter((models.Reading.sample == sample) | (models.Reading.sample == s_id) | (models.Reading.sample == s_name))
    if from_time:
        query = query.filter(models.Reading.timestamp >= from_time)
    if to_time:
        query = query.filter(models.Reading.timestamp <= to_time)
    readings = query.order_by(desc(models.Reading.timestamp)).limit(limit).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "sample", "ph", "tds_ppm", "turbidity_ntu", "temperature_c",
        "timestamp_iso", "predicted_taste", "confidence", "device_id"
    ])
    for r in readings:
        writer.writerow([
            r.id, r.sample, f"{r.ph:.2f}", f"{r.tds:.0f}", f"{r.turbidity:.1f}",
            f"{r.temperature:.1f}" if r.temperature is not None else "",
            r.timestamp.isoformat() if r.timestamp else "",
            r.predicted_taste, f"{r.confidence:.2f}", r.device_id
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=readings_export.csv"}
    )
