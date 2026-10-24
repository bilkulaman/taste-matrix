import random
import uuid
from datetime import datetime, timezone, timedelta
from database import SessionLocal, Base, engine
import models
from predictor import predict

# 4 profiles: Distilled Water 6.9, 345, 0 | Haldi Water 6.4, 0, 0 | Basic Water 7.8, 1240, 92 | Chalk Water 6.1, 1283, 45
# Tolerances around profile: TDS +/-3%, pH +/-0.1, turbidity +/-3
SAMPLE_PROFILES = [
    {"name": "Distilled Water", "ph": 6.9, "tds": 345.0,  "turbidity": 0.0},
    {"name": "Haldi Water",     "ph": 6.4, "tds": 0.0,    "turbidity": 0.0},
    {"name": "Basic Water",     "ph": 7.8, "tds": 1240.0, "turbidity": 92.0},
    {"name": "Chalk Water",     "ph": 6.1, "tds": 1283.0, "turbidity": 45.0},
]

INITIAL_KANBAN = [
    {"sample": "Haldi Water",     "name": "Curcuma Longa Standard Batch 04",  "status": "verified",  "notes": "Optimal curcumin suspension"},
    {"sample": "Basic Water",     "name": "Alkaline Mineral Salt Solution",   "status": "verified",  "notes": "Verified Lavana ionic profile"},
    {"sample": "Chalk Water",     "name": "Calcium Carbonate Extract #08",     "status": "analyzing", "notes": "Active astringent turbidity acquisition"},
    {"sample": "Distilled Water", "name": "Pure Reference Blank",             "status": "pending",   "notes": "Baseline sensor zero check"},
    {"sample": "Chalk Water",     "name": "Chalk Water Batch 02",             "status": "flagged",   "notes": "Turbidity deviation flagged"},
    {"sample": "Haldi Water",     "name": "Curcuma Aqueous Extract Batch 05",  "status": "pending",   "notes": "Queued for automated testing"},
]

INITIAL_ALERTS = [
    {"message": "Turbidity spike: Basic Water reached 92.0 index – above 80 index threshold.", "severity": "warn",  "sample": "Basic Water",     "read": False},
    {"message": "pH calibration stable across last 24 runs for Distilled Water (6.90 ± 0.03).",  "severity": "info",  "sample": "Distilled Water", "read": False},
    {"message": "Chalk Water bio-fingerprint verified: Kashaya rasa detected with high confidence.", "severity": "info", "sample": "Chalk Water",     "read": True},
    {"message": "Zero TDS reading verified for Haldi Water reference profile.",                     "severity": "info",  "sample": "Haldi Water",     "read": True},
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        for sample_info in SAMPLE_PROFILES:
            name = sample_info["name"]
            existing_count = db.query(models.Reading).filter(models.Reading.sample == name).count()
            if existing_count < 16:
                print(f"Seeding readings for {name} around profile (TDS +/-3%, pH +/-0.1, turbidity +/-3)...")
                base_ph = sample_info["ph"]
                base_tds = sample_info["tds"]
                base_turb = sample_info["turbidity"]

                for i in range(16):
                    ts = now - timedelta(seconds=(16 - i) * 6)

                    c_ph = max(0.0, min(14.0, base_ph + random.uniform(-0.1, 0.1)))
                    tds_delta = base_tds * 0.03
                    c_tds = max(0.0, min(5000.0, base_tds + random.uniform(-tds_delta, tds_delta)))
                    c_turb = max(0.0, min(100.0, base_turb + random.uniform(-3.0, 3.0)))

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
            else:
                print(f"Sample {name} already has {existing_count} readings.")

        # Seed initial kanban tests if empty
        if db.query(models.Test).count() == 0:
            for t in INITIAL_KANBAN:
                p = next((sp for sp in SAMPLE_PROFILES if sp["name"] == t["sample"]), SAMPLE_PROFILES[0])
                pred = predict(ph=p["ph"], tds=p["tds"], turbidity=p["turbidity"])

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
