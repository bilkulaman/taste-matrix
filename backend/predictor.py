import math
from typing import Dict, Any

# Reference profiles: Distilled Water 6.9, 345, 0 | Haldi Water 6.4, 0, 0 | Basic Water 7.8, 1240, 92 | Chalk Water 6.1, 1283, 45
REFERENCE_PROFILES = [
    {"name": "Distilled Water", "ph": 6.9, "tds": 345.0, "turbidity": 0.0,  "rasa": "Anabhilashita"},
    {"name": "Haldi Water",     "ph": 6.4, "tds": 0.0,   "turbidity": 0.0,  "rasa": "Tikta"},
    {"name": "Basic Water",     "ph": 7.8, "tds": 1240.0, "turbidity": 92.0, "rasa": "Lavana"},
    {"name": "Chalk Water",     "ph": 6.1, "tds": 1283.0, "turbidity": 45.0, "rasa": "Kashaya"},
]

def profile_distance(ph: float, tds: float, turbidity: float, p: float, t: float, u: float) -> float:
    ph_term = ((ph - p) / 1.0) ** 2
    tds_term = ((math.log10(max(0.0, tds) + 1.0) - math.log10(max(0.0, t) + 1.0)) / 1.5) ** 2
    turb_term = ((turbidity - u) / 50.0) ** 2
    return math.sqrt(ph_term + tds_term + turb_term)

def predict(ph: float, tds: float, turbidity: float) -> Dict[str, Any]:
    """
    Ayurvedic Rasa predictor based on E-Tongue measurements.
    
    Inputs:
      - ph: 0 - 14
      - tds: Total Dissolved Solids in ppm
      - turbidity: relative index 0-100
      
    Outputs:
      {
        "taste": str ("Madhura", "Amla", "Lavana", "Katu", "Tikta", "Kashaya", "Anabhilashita"),
        "confidence": float (0.0 to 1.0),
        "breakdown": {
          "madhura": float,
          "amla": float,
          "lavana": float,
          "katu": float,
          "tikta": float,
          "kashaya": float
        }
      }
    """
    # Calculate distance to nearest profile
    profile_dists = []
    for prof in REFERENCE_PROFILES:
        d = profile_distance(ph, tds, turbidity, prof["ph"], prof["tds"], prof["turbidity"])
        profile_dists.append((prof, d))
    profile_dists.sort(key=lambda x: x[1])
    nearest_prof, nearest_dist = profile_dists[0]

    # Confidence derived from distance: closer to profile -> higher confidence
    confidence = max(0.50, min(0.98, round(1.0 - (nearest_dist / 4.0), 2)))

    # Predict rules in specified order:
    # 1. turbidity > 70 and pH > 7.5 -> Lavana
    if turbidity > 70 and ph > 7.5:
        taste = "Lavana"
    # 2. 30 < turbidity <= 70 and TDS > 800 -> Kashaya
    elif 30 < turbidity <= 70 and tds > 800:
        taste = "Kashaya"
    # 3. pH < 6.6 and TDS < 100 -> Tikta
    elif ph < 6.6 and tds < 100:
        taste = "Tikta"
    # 4. pH 6.6-7.2 and TDS < 500 and turbidity < 10 -> Anabhilashita (no dominant rasa)
    elif 6.6 <= ph <= 7.2 and tds < 500 and turbidity < 10:
        taste = "Anabhilashita"
    # 5. Else use the nearest profile's rasa
    else:
        taste = nearest_prof["rasa"]

    # Build 6-rasa breakdown
    rasa_keys = ["madhura", "amla", "lavana", "katu", "tikta", "kashaya"]
    target_key = taste.lower()

    if target_key not in rasa_keys:
        # Anabhilashita: even distribution across rasas (neutral)
        breakdown = {k: 16.7 for k in rasa_keys}
        breakdown["kashaya"] = 16.5
    else:
        # Dominant percentage aligned with confidence
        dominant_pct = round(confidence * 100.0, 1)
        remaining_pct = round(100.0 - dominant_pct, 1)
        other_keys = [k for k in rasa_keys if k != target_key]
        per_other = round(remaining_pct / len(other_keys), 1)

        breakdown = {k: per_other for k in other_keys}
        breakdown[target_key] = dominant_pct

        # Fix minor rounding discrepancies
        diff = round(100.0 - sum(breakdown.values()), 1)
        if diff != 0:
            breakdown[target_key] = round(breakdown[target_key] + diff, 1)

    return {
        "taste": taste,
        "confidence": confidence,
        "breakdown": breakdown
    }
