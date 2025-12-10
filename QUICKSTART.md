# Quick Start Guide

## Terminal 1: Backend Server

```bash
cd "AI Investment Dashboard Project "
source venv/bin/activate
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Terminal 2: Frontend Server

```bash
cd "AI Investment Dashboard Project "
cd frontend
python3 -m http.server 3000
```

**Dashboard**: [http://localhost:3000](http://localhost:3000)
