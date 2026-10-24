import sys, time, random, requests
url = sys.argv[1].rstrip("/"); key = sys.argv[2]
S = {
    "Distilled Water": (6.9, 345.0, 0.0),
    "Haldi Water": (6.4, 0.0, 0.0),
    "Basic Water": (7.8, 1240.0, 92.0),
    "Chalk Water": (6.1, 1283.0, 45.0)
}
while True:
    for name, (base_ph, base_tds, base_turb) in S.items():
        tds_delta = base_tds * 0.03
        ph = max(0.0, min(14.0, base_ph + random.uniform(-0.1, 0.1)))
        tds = max(0.0, min(5000.0, base_tds + random.uniform(-tds_delta, tds_delta)))
        turb = max(0.0, min(100.0, base_turb + random.uniform(-3.0, 3.0)))
        body = {
            "device_id": "esp32-node-01",
            "sample": name,
            "ph": round(ph, 2),
            "tds": round(tds, 1),
            "turbidity": round(turb, 1),
            "temperature": 25.4
        }
        try:
            r = requests.post(url + "/readings", json=body, headers={"X-Device-Key": key}, timeout=60)
            print(name, r.status_code, r.text[:90])
        except Exception as e:
            print(name, "error", e)
        time.sleep(0.2)
    time.sleep(3)
