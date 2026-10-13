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

SAMPLE_PROFILES = {
    "Distilled Water": {
        "ph_range": (6.9, 7.2),
        "tds_range": (5.0, 15.0),
        "turb_range": (0.1, 0.5),
        "temp_range": (24.0, 25.5),
        "drift": {"ph": 0.02, "tds": 0.5, "turb": 0.05}
    },
    "Salt Water": {
        "ph_range": (6.8, 7.4),
        "tds_range": (1800.0, 2400.0),
        "turb_range": (2.0, 8.0),
        "temp_range": (24.5, 26.0),
        "drift": {"ph": 0.03, "tds": 25.0, "turb": 0.3}
    },
    "Sugar Water": {
        "ph_range": (6.5, 7.1),
        "tds_range": (150.0, 250.0),
        "turb_range": (1.0, 4.0),
        "temp_range": (24.2, 25.8),
        "drift": {"ph": 0.03, "tds": 6.0, "turb": 0.2}
    },
    "Haldi Water": {
        "ph_range": (6.4, 7.0),
        "tds_range": (280.0, 480.0),
        "turb_range": (80.0, 110.0),
        "temp_range": (24.8, 26.5),
        "drift": {"ph": 0.04, "tds": 10.0, "turb": 2.5}
    },
    "Neem Water": {
        "ph_range": (5.6, 6.2),
        "tds_range": (190.0, 360.0),
        "turb_range": (30.0, 65.0),
        "temp_range": (24.5, 26.0),
        "drift": {"ph": 0.03, "tds": 8.0, "turb": 1.2}
    }
}

class SampleWalker:
    def __init__(self, name: str, config: dict):
        self.name = name
        self.config = config
        self.ph = (config["ph_range"][0] + config["ph_range"][1]) / 2.0
        self.tds = (config["tds_range"][0] + config["tds_range"][1]) / 2.0
        self.turb = (config["turb_range"][0] + config["turb_range"][1]) / 2.0
        self.temp = (config["temp_range"][0] + config["temp_range"][1]) / 2.0

    def step(self):
        d = self.config["drift"]
        # Gaussian random walk within boundaries
        self.ph += random.gauss(0, d["ph"])
        self.tds += random.gauss(0, d["tds"])
        self.turb += random.gauss(0, d["turb"])
        self.temp += random.gauss(0, 0.05)

        # Clamp to realistic ranges
        self.ph = max(self.config["ph_range"][0], min(self.config["ph_range"][1], self.ph))
        self.tds = max(self.config["tds_range"][0], min(self.config["tds_range"][1], self.tds))
        self.turb = max(self.config["turb_range"][0], min(self.config["turb_range"][1], self.turb))
        self.temp = max(self.config["temp_range"][0], min(self.config["temp_range"][1], self.temp))

        return {
            "device_id": DEVICE_ID,
            "sample": self.name,
            "ph": round(self.ph, 2),
            "tds": round(self.tds, 1),
            "turbidity": round(self.turb, 1),
            "temperature": round(self.temp, 1)
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
            print(f"[{payload['sample']}] Sent: pH={payload['ph']} TDS={payload['tds']}ppm Turb={payload['turbidity']}NTU -> {data.get('predicted_taste')} ({int(data.get('confidence', 0)*100)}%)")
        else:
            print(f"Error ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"Connection failed to {url}: {e}")

def main():
    parser = argparse.ArgumentParser(description="TasteMatrix ESP32 Hardware Simulator")
    parser.add_argument("--sample", type=str, default="Salt Water", help="Specific sample name or alias")
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
            selected_sample = "Salt Water"
            print(f"Warning: '{args.sample}' not recognized, defaulting to Salt Water.")

    print(f"TasteMatrix Simulator started.")
    print(f"Target: {API_URL} | Interval: {args.interval}s | Device: {DEVICE_ID}")
    if args.all:
        print("Mode: Broadcasting all samples round-robin.")
    else:
        print(f"Mode: Single sample [{selected_sample}].")
    print("-" * 65)

    all_names = list(SAMPLE_PROFILES.keys())
    cycle_idx = 0

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
