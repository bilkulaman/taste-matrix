import random
import uuid
from datetime import datetime, timezone, timedelta
from database import SessionLocal, Base, engine
import models
from predictor import predict

SAMPLE_PROFILES = [
    {"name": "Distilled Water", "ph": (6.9, 7.2), "tds": (5, 15), "turbidity": (0.1, 0.5)},
    {"name": "Salt Water",      "ph": (6.8, 7.4), "tds": (1800, 2400), "turbidity": (2.0, 8.0)},
    {"name": "Sugar Water",     "ph": (6.5, 7.1), "tds": (150, 250), "turbidity": (1.0, 4.0)},
    {"name": "Haldi Water",     "ph": (6.4, 7.0), "tds": (280, 480), "turbidity": (80, 110)},
    {"name": "Neem Water",      "ph": (5.6, 6.2), "tds": (190, 360), "turbidity": (30, 65)},
]

INITIAL_KANBAN = [
    {"sample": "Haldi Water",     "name": "Curcuma Longa Standard Batch 04",  "status": "verified",  "notes": "Optimal curcumin suspension"},
    {"sample": "Neem Water",      "name": "Azadirachta Indica Extract #12",    "status": "verified",  "notes": "Verified bitter alkaloid profile"},
    {"sample": "Salt Water",      "name": "Saindhava Lavana Assay #08",        "status": "analyzing", "notes": "Active bio-impedance acquisition"},
    {"sample": "Sugar Water",     "name": "Sharkara Calibration Run 02",       "status": "pending",   "notes": "Awaiting spectral stabilization"},
    {"sample": "Distilled Water", "name": "Milli-Q Baseline Blank",            "status": "flagged",   "notes": "Residual particulate flagged"},
    {"sample": "Haldi Water",     "name": "Curcuma Aqueous Extract Batch 05",  "status": "pending",   "notes": "Queued for automated testing"},
]

INITIAL_ALERTS = [
    {"message": "Turbidity spike: Haldi Water reached 94.3 NTU – above 80 NTU baseline threshold.", "severity": "warn",  "sample": "Haldi Water", "read": False},
    {"message": "pH calibration stable across last 24 runs for Salt Water (7.18 ± 0.03).",           "severity": "info",  "sample": "Salt Water",  "read": False},
    {"message": "TDS sensor drift notice: automatic zero-point drift corrected (+12 ppm).",        "severity": "warn",  "sample": "Distilled Water", "read": True},
    {"message": "Neem Water bio-fingerprint verified: Tikta rasa detected with 91% ML confidence.", "severity": "info",  "sample": "Neem Water",  "read": True},
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_readings = db.query(models.Reading).count()
        if existing_readings >= 40:
            print(f"Database already has {existing_readings} readings. Skipping seed.")
            return

        print("Seeding initial historical readings, kanban tests, and alerts...")
        now = datetime.now(timezone.utc)

        # Seed ~15 readings per sample
        for sample_info in SAMPLE_PROFILES:
            name = sample_info["name"]
            ph_min, ph_max = sample_info["ph"]
            tds_min, tds_max = sample_info["tds"]
            turb_min, turb_max = sample_info["turbidity"]

            # Current walking values
            c_ph = (ph_min + ph_max) / 2
            c_tds = (tds_min + tds_max) / 2
            c_turb = (turb_min + turb_max) / 2

            for i in range(16):
                # timestamp stepping backwards from now
                ts = now - timedelta(seconds=(16 - i) * 6)
                
                # small random walk
                c_ph = max(ph_min, min(ph_max, c_ph + random.uniform(-0.06, 0.06)))
                c_tds = max(tds_min, min(tds_max, c_tds + random.uniform(-15, 15)))
                c_turb = max(turb_min, min(turb_max, c_turb + random.uniform(-1.5, 1.5)))

                pred = predict(ph=c_ph, tds=c_tds, turbidity=c_turb)

                reading = models.Reading(
                    sample=name,
                    ph=round(c_ph, 2),
                    tds=round(c_tds, 1),
                    turbidity=round(c_turb, 1),
                    temperature=round(random.uniform(24.5, 26.2), 1),
                    timestamp=ts,
                    predicted_taste=pred["taste"],
                    confidence=pred["confidence"],
                    device_id="esp32-node-01"
                )
                db.add(reading)

        # Seed initial kanban tests if empty
        if db.query(models.Test).count() == 0:
            for t in INITIAL_KANBAN:
                # determine sample profile center for realistic prediction
                p = next((sp for sp in SAMPLE_PROFILES if sp["name"] == t["sample"]), SAMPLE_PROFILES[0])
                avg_ph = (p["ph"][0] + p["ph"][1]) / 2
                avg_tds = (p["tds"][0] + p["tds"][1]) / 2
                avg_turb = (p["turbidity"][0] + p["turbidity"][1]) / 2
                pred = predict(ph=avg_ph, tds=avg_tds, turbidity=avg_turb)

                test = models.Test(
                    id=f"tst-{uuid.uuid4().hex[:8]}",
                    sample=t["sample"],
                    name=t["name"],
                    status=t["status"],
                    predicted_taste=pred["taste"],
                    confidence=pred["confidence"],
                    created_at=now - timedelta(minutes=random.randint(2, 45)),
                    notes=t["notes"]
                )
                db.add(test)

        # Seed initial alerts if empty
        if db.query(models.Alert).count() == 0:
            for idx, a in enumerate(INITIAL_ALERTS):
                alert = models.Alert(
                    id=f"alt-{uuid.uuid4().hex[:8]}",
                    message=a["message"],
                    severity=a["severity"],
                    sample=a["sample"],
                    created_at=now - timedelta(minutes=(idx + 1) * 8),
                    read=a["read"]
                )
                db.add(alert)

        db.commit()
        print("Seeding complete successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
