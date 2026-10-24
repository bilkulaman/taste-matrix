import argparse
import time
import random
import sys
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("API_URL", "http://localhost:8000")
DEVICE_KEY = os.getenv("DEVICE_KEY", "tm-esp32-secret-key-2026")
DEVICE_ID = os.getenv("DEVICE_ID", "esp32-node-01")

# Reference profiles:
# Distilled Water 6.9, 345, 0
# Haldi Water 6.4, 0, 0
# Basic Water 7.8, 1240, 92
# Chalk Water 6.1, 1283, 45
# Tolerances around profile: TDS +/-3%, pH +/-0.1, turbidity +/-3
SAMPLE_PROFILES = {
    "Distilled Water": {
        "ph_base": 6.9,
        "tds_base": 345.0,
        "turb_base": 0.0,
        "temp_base": 24.5,
    },
    "Haldi Water": {
        "ph_base": 6.4,
        "tds_base": 0.0,
        "turb_base": 0.0,
        "temp_base": 25.0,
    },
    "Basic Water": {
        "ph_base": 7.8,
        "tds_base": 1240.0,
        "turb_base": 92.0,
        "temp_base": 25.2,
    },
    "Chalk Water": {
        "ph_base": 6.1,
        "tds_base": 1283.0,
        "turb_base": 45.0,
        "temp_base": 24.8,
    },
}

class SampleWalker:
    def __init__(self, name: str, config: dict):
        self.name = name
        self.config = config

    def step(self):
        # Generate readings around the profile: TDS +/-3%, pH +/-0.1, turbidity +/-3
        base_ph = self.config["ph_base"]
        base_tds = self.config["tds_base"]
        base_turb = self.config["turb_base"]
        base_temp = self.config["temp_base"]

        tds_delta = base_tds * 0.03
        ph = max(0.0, min(14.0, base_ph + random.uniform(-0.1, 0.1)))
        tds = max(0.0, min(5000.0, base_tds + random.uniform(-tds_delta, tds_delta)))
        turb = max(0.0, min(100.0, base_turb + random.uniform(-3.0, 3.0)))
        temp = base_temp + random.uniform(-0.2, 0.2)

        return {
            "device_id": DEVICE_ID,
            "sample": self.name,
            "ph": round(ph, 2),
            "tds": round(tds, 1),
            "turbidity": round(turb, 1),
            "temperature": round(temp, 1)
        }

def send_reading(payload: dict):
    url = f"{API_URL}/readings"
    headers = {
        "X-Device-Key": DEVICE_KEY,
        "Content-Type": "application/json"
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=5)
        if resp.status_code == 201:
            data = resp.json()
            matched = data.get("matched_sample", "")
            match_conf = int(data.get("match_confidence", 0) * 100)
            print(f"[{payload['sample']}] Sent: pH={payload['ph']} TDS={payload['tds']}ppm Turb={payload['turbidity']} -> {data.get('predicted_taste')} ({int(data.get('confidence', 0)*100)}%) [Matched: {matched} {match_conf}%]")
        else:
            print(f"Error ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"Connection failed to {url}: {e}")

def main():
    parser = argparse.ArgumentParser(description="TasteMatrix ESP32 Hardware Simulator")
    parser.add_argument("--sample", type=str, default="Distilled Water", help="Specific sample name or alias")
    parser.add_argument("--interval", type=float, default=3.0, help="Polling interval in seconds (default: 3.0)")
    parser.add_argument("--all", action="store_true", help="Cycle through or simulate every sample")
    args = parser.parse_args()

    # Build walkers
    walkers = {name: SampleWalker(name, cfg) for name, cfg in SAMPLE_PROFILES.items()}

    # Match target sample if not --all
    selected_sample = None
    if not args.all:
        for name in SAMPLE_PROFILES.keys():
            if name.lower() == args.sample.strip().lower() or name.lower().replace(" ", "-") == args.sample.strip().lower():
                selected_sample = name
                break
        if not selected_sample:
            selected_sample = "Distilled Water"
            print(f"Warning: '{args.sample}' not recognized, defaulting to Distilled Water.")

    print(f"TasteMatrix Simulator started.")
    print(f"Target: {API_URL} | Interval: {args.interval}s | Device: {DEVICE_ID}")
    if args.all:
        print("Mode: Broadcasting all samples.")
    else:
        print(f"Mode: Single sample [{selected_sample}].")
    print("-" * 65)

    all_names = list(SAMPLE_PROFILES.keys())

    try:
        while True:
            if args.all:
                for target_name in all_names:
                    payload = walkers[target_name].step()
                    send_reading(payload)
            else:
                payload = walkers[selected_sample].step()
                send_reading(payload)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")

if __name__ == "__main__":
    main()
