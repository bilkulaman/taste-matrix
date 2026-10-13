import math
from typing import Dict, Any

def predict(ph: float, tds: float, turbidity: float) -> Dict[str, Any]:
    """
    Rule-based Ayurvedic Rasa predictor based on E-Tongue measurements.
    
    Inputs:
      - ph: 0 - 14
      - tds: Total Dissolved Solids in ppm
      - turbidity: NTU
      
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
    # Baseline weights
    weights = {
        "madhura": 5.0,
        "amla": 5.0,
        "lavana": 5.0,
        "katu": 5.0,
        "tikta": 5.0,
        "kashaya": 5.0,
    }

    # 1. Distilled / Neutral water detection (very low everything)
    if tds < 35 and turbidity < 2.0 and 6.5 <= ph <= 7.5:
        return {
            "taste": "Anabhilashita",
            "confidence": 0.98,
            "breakdown": {
                "madhura": 16.6,
                "amla": 16.6,
                "lavana": 16.6,
                "katu": 16.6,
                "tikta": 16.6,
                "kashaya": 17.0,
            }
        }

    # 2. Lavana (Salty): High TDS (> 1200)
    if tds > 1200:
        factor = min(1.0, (tds - 1200) / 1500)
        weights["lavana"] += 60.0 * factor + 30.0

    # 3. Amla (Sour): Low pH (< 5.8)
    if ph < 5.8:
        factor = min(1.0, (5.8 - ph) / 3.0)
        weights["amla"] += 65.0 * factor + 35.0

    # 4. Madhura (Sweet): Low/moderate TDS (80-450), low turbidity (< 15), neutral/slightly alkaline pH (6.5-7.8)
    if 70 <= tds <= 450 and turbidity < 15 and 6.4 <= ph <= 8.2:
        weights["madhura"] += 60.0

    # 5. Katu (Pungent): High turbidity (> 60) with neutral to high pH (6.8-8.5)
    if turbidity > 60 and 6.6 <= ph <= 8.5:
        weights["katu"] += 50.0

    # 6. Tikta (Bitter): Mildly acidic/neutral pH (5.2 - 6.8) with moderate to high turbidity (20 - 140)
    # (e.g. Haldi Water, Neem Water)
    if 5.0 <= ph <= 7.5 and turbidity >= 25:
        weights["tikta"] += 55.0
        if 5.4 <= ph <= 6.4:  # Neem profile
            weights["tikta"] += 25.0

    # 7. Kashaya (Astringent): Mildly acidic with slight particulate / astringent profile
    if 5.8 <= ph <= 6.8 and 10 <= turbidity <= 40 and tds < 300:
        weights["kashaya"] += 35.0

    # Normalize breakdown so percentages sum to 100
    total_w = sum(weights.values())
    breakdown = {}
    for rasa, w in weights.items():
        breakdown[rasa] = round((w / total_w) * 100.0, 1)

    # Adjust rounding differences so sum == 100
    current_sum = sum(breakdown.values())
    diff = round(100.0 - current_sum, 1)
    if diff != 0:
        # adjust the maximum key
        top_rasa_key = max(breakdown, key=breakdown.get)
        breakdown[top_rasa_key] = round(breakdown[top_rasa_key] + diff, 1)

    # Determine winning rasa
    top_rasa = max(breakdown, key=breakdown.get)
    rasa_names = {
        "madhura": "Madhura",
        "amla": "Amla",
        "lavana": "Lavana",
        "katu": "Katu",
        "tikta": "Tikta",
        "kashaya": "Kashaya",
    }
    predicted_taste = rasa_names.get(top_rasa, "Anabhilashita")

    # Calculate confidence based on dominance of winning rasa
    dominant_pct = breakdown[top_rasa]
    confidence = min(0.98, max(0.65, round(0.50 + (dominant_pct / 100.0) * 0.50, 2)))

    return {
        "taste": predicted_taste,
        "confidence": confidence,
        "breakdown": breakdown
    }
