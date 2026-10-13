# TasteMatrix Backend

FastAPI backend for TasteMatrix Ayurvedic Dravya Electronic Tongue platform.

## Features
- **FastAPI + SQLAlchemy + Pydantic**: Async REST API with automatic SQLite / PostgreSQL support.
- **Rule-based Rasa Predictor**: Calculates Ayurvedic taste profiles (Madhura, Amla, Lavana, Katu, Tikta, Kashaya, Anabhilashita) with 100% normalized breakdowns.
- **Device Authentication & Ingestion**: ESP32 hardware authentication with `X-Device-Key` header, validating range boundaries and triggering alerts on anomalies.
- **Hardware Simulator**: Random-walk hardware simulation per sample with round-robin support (`--all`).
- **Telemetry History & CSV Export**: Continuous reading logs, status endpoint, and Kanban assay tracking.

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
Default values:
- `DATABASE_URL`: `sqlite:///./tastematrix.db`
- `DEVICE_KEY`: `tm-esp32-secret-key-2026`
- `FRONTEND_ORIGIN`: `http://localhost:5173`

### 3. Seed Database
Seeds ~15 baseline readings per sample along with initial alerts and Kanban tests:
```bash
python seed.py
```

### 4. Run the API Server
```bash
uvicorn main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 5. Run the Hardware Simulator
In a separate terminal:
```bash
# Simulate all samples round-robin every 3 seconds:
python simulator.py --all

# Or simulate a single specific sample:
python simulator.py --sample "Salt Water" --interval 3
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/readings` | Ingest sensor reading with `X-Device-Key` header |
| `GET` | `/readings/latest?sample=` | Fetch latest sensor reading |
| `GET` | `/readings?sample=&from=&to=&limit=` | Fetch historical readings (newest last) |
| `GET` | `/samples` | Summary of samples, test counts, and last readings |
| `POST` | `/predict` | Run taste model on `{ph, tds, turbidity}` |
| `GET` | `/device/status` | ESP32 device connection status and online flag |
| `GET` | `/alerts` | Get quality alerts |
| `POST` | `/alerts/{id}/read` | Mark single alert as read |
| `POST` | `/alerts/read-all` | Mark all alerts as read |
| `POST` | `/tests` | Create new assay card |
| `GET` | `/tests` | Get assay test cards |
| `PATCH`| `/tests/{id}` | Update test status or verdict |
| `DELETE`| `/tests/{id}` | Delete test card |
| `GET` | `/export/readings.csv` | Export readings history as CSV |
| `GET` | `/health` | Healthcheck endpoint |
