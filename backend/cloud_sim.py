import sys, time, random, requests
url = sys.argv[1].rstrip("/"); key = sys.argv[2]
S = {"Distilled Water": (7.0, 10, 0.3), "Salt Water": (7.1, 2100, 4),
     "Sugar Water": (6.8, 190, 2), "Haldi Water": (6.7, 350, 94), "Neem Water": (5.85, 290, 48)}
state = {k: list(v) for k, v in S.items()}
while True:
    for name, v in state.items():
        base = S[name]
        for i in range(3):
            v[i] = max(0.05, v[i] + random.uniform(-0.02, 0.02) * base[i] + (base[i] - v[i]) * 0.1)
        body = {"device_id": "esp32-node-01", "sample": name, "ph": round(v[0], 2),
                "tds": round(v[1], 1), "turbidity": round(v[2], 1), "temperature": 25.4}
        try:
            r = requests.post(url + "/readings", json=body, headers={"X-Device-Key": key}, timeout=60)
            print(name, r.status_code, r.text[:90])
        except Exception as e:
            print(name, "error", e)
        time.sleep(0.2)
    time.sleep(3)
