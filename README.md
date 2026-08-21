# Oceanographic Insights

AI-driven unified data platform for **oceanographic**, **fisheries**, and **molecular biodiversity (eDNA)** insights. Built for Smart India Hackathon — Problem Statement 20.

Marine research data currently lives in three silos. This monorepo brings them onto one stack:

| Silo | Typical fields |
| --- | --- |
| Oceanographic | Water temperature, salinity, depth, oxygen |
| Fisheries | Catch weight, species, locations, vessel IDs |
| eDNA / Molecular | Gene markers, sample IDs, target species matches |

## Architecture

```
frontend (Vite/React :5173)
    └── /api  →  backend (Express :5000)
                     ├── MongoDB (:27017)
                     ├── Redis (:6379)
                     └── ai-service (FastAPI :8000)
```

- **`/backend`** — Node.js, Express, Mongoose, Redis, Multer, CSV parser
- **`/frontend`** — React (Vite), Tailwind CSS, Lucide Icons, Leaflet, Recharts
- **`/ai-service`** — Python 3.10, FastAPI, BioPython, scikit-learn, Pandas

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2

## Start the full environment

From the repository root:

```bash
docker-compose up --build
```

The first build of `ai-service` can take several minutes because BioPython and scikit-learn are compiled/installed into the image.

When the stack is healthy:

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend health | http://localhost:5000/api/health |
| AI service docs | http://localhost:8000/docs |
| MongoDB | `localhost:27017` |
| Redis | `localhost:6379` |

Stop everything with `Ctrl+C`, or run `docker-compose down`. MongoDB data is stored in the `mongo_data` Docker volume and survives restarts.

## Local development (without Docker)

Copy `backend/.env.example` to `backend/.env` and point `MONGO_URI` / `REDIS_URL` at local instances.

```bash
# backend
cd backend && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev

# ai-service
cd ai-service && python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Vite dev server proxies `/api` to `http://localhost:5000` (or `VITE_PROXY_TARGET` when running in Compose).
