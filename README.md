# posAIdon — AI Oceanographic & Marine Biodiversity Platform

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Problem_Statement_20-0ea5e9?style=for-the-badge&logo=target)](https://www.sih.gov.in/)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Express_+_Node.js-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI_Service-FastAPI_+_BioPython-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Redis-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**posAIdon** is an AI-driven, multi-modal marine intelligence platform engineered to bridge the three isolated silos of ocean data: **Physical Oceanography**, **Commercial Fisheries Telemetry**, and **Molecular Environmental DNA (eDNA) Biodiversity**.

Built specifically for **Smart India Hackathon (SIH) — Problem Statement 20**, posAIdon provides marine researchers and government policymakers with real-time geospatial correlation, automated biological sequence verification, and predictive machine learning models across the **Arabian Sea & Indian Ocean**.

---

## Table of Contents

- [The Core Purpose](#-the-core-purpose)
- [The Tri-Silo Marine Problem](#-the-tri-silo-marine-problem)
- [Key Features](#-key-features)
  - [1. Interactive GIS Ocean Workspace](#1-interactive-gis-ocean-workspace)
  - [2. Multi-Silo Data Ingestion Pipeline](#2-multi-silo-data-ingestion-pipeline)
  - [3. AI Predictive Analytics & Climate Coupling](#3-ai-predictive-analytics--climate-coupling)
  - [4. Interactive Homepage & Simulation](#4-interactive-homepage--simulation)
  - [5. Dual Persona System (Researcher vs. Policy Maker)](#5-dual-persona-system)
- [Benefits to Stakeholders](#-benefits-to-stakeholders)
  - [For Marine Researchers & Scientists](#for-marine-researchers--scientists)
  - [For Governors & Policy Makers](#for-governors--marine-regulators--policy-makers)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Running with Docker Compose (Recommended)](#1-running-with-docker-compose-recommended)
  - [Local Development Setup](#2-local-development-setup-without-docker)
- [API Reference](#-api-reference)
- [Project Directory Structure](#-project-directory-structure)

---

## 🎯 The Core Purpose

Traditional marine research is severely bottlenecked by **data fragmentation**. Physical sensor logs from buoys, commercial catch reports from fishing vessels, and genomic sequences from eDNA water samples are collected by separate agencies and stored in isolated formats. 

Because there was no unified framework to correlate these dimensions in space and time, scientists struggled to understand how rising sea temperatures impact specific fish species, and regulators had to set fishing quotas using delayed, incomplete data.

**posAIdon solves this by:**
1. **Unifying Multimodal Datasets**: Ingesting and spatio-temporally indexing ocean physics, fisheries telemetry, and eDNA barcodes into one high-performance GIS interface.
2. **AI Climate Impact Forecasting**: Employing machine learning to model how Sea Surface Temperature (SST) warming shifts commercial catch yields and species migration.
3. **Genomic Validation Pipeline**: Automatically parsing FASTA sequence files and matching 16S rRNA, COI, and 18S genetic markers against regional marine biodiversity baselines.

---

## 🌊 The Tri-Silo Marine Problem

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│   PHYSICAL OCEANOGRAPHY │   │   COMMERCIAL FISHERIES  │   │     MOLECULAR eDNA      │
├─────────────────────────┤   ├─────────────────────────┤   ├─────────────────────────┤
│ • Sea Surface Temp (SST)│   │ • Catch Biomass (kg)    │   │ • 16S / COI / 18S Genes │
│ • Salinity (PSU)        │   │ • Species Landed        │   │ • Sequence Verification │
│ • Dissolved Oxygen      │   │ • Vessel Telemetry & ID │   │ • Organism Presence     │
│ • Depth Profiles (m)    │   │ • Fishing Zones         │   │ • Biodiversity Baselines│
└────────────┬────────────┘   └────────────┬────────────┘   └────────────┬────────────┘
             │                             │                             │
             └──────────────────────┬──────┴─────────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │      posAIdon       │
                         │ Unified AI Platform │
                         └─────────────────────┘
```

---

## 🚀 Key Features

### 1. Interactive GIS Ocean Workspace
- **Multi-Modal Layer Overlays**: Toggle and cross-reference physical ocean sensors, commercial catch logs, and eDNA biodiversity markers simultaneously.
- **Dynamic Heatmaps**: Visual representation of Sea Surface Temperature gradients, salinity variations, and catch density hotspots.
- **Radius & Bounding Box Filtering**: Run spatial radius queries (`lat`, `lng`, `radiusKm`) with sub-second response times powered by Redis geospatial caching.
- **Unified Sample Modal**: Deep-dive inspector correlating physical water parameters, detected species, and commercial vessel logs at any chosen geographic coordinate.

### 2. Multi-Silo Data Ingestion Pipeline
- **Oceanography Ingestion**: Upload physical sensor logs (CSV) with automatic schema normalization for temperature, salinity, oxygen, and depth.
- **Fisheries Log Ingestion**: Upload commercial catch records (CSV) tracking catch weight, gear type, vessel ID, and species names.
- **eDNA Genomic Pipeline**: Native support for both CSV records and raw **FASTA biological sequence files** (`.fasta`, `.fa`, `.fna`).
- **BioPython Sequence Verification**: Automatic verification of genetic marker types (**16S rRNA**, **COI**, **18S**) and taxonomy matching.

### 3. AI Predictive Analytics & Climate Coupling
- **SST vs. Catch Coupling**: Dynamic regression charts analyzing how local temperature changes directly correlate with target species biomass fluctuations.
- **Automated Early Warnings**: Instant alerts when thermal stress or marine heatwaves correlate with target species catch declines (e.g., *Mackerel*, *Sardine*, *Tuna*).
- **Biodiversity Distribution**: Quantitative frequency breakdown of detected eDNA species across the queried marine boundary.
- **Machine Learning Impact Predictor**: API endpoint (`/api/predict-impact`) delivering percentage catch change projections and environmental risk scores.

### 4. Interactive Homepage & Simulation
- **3D Feature Flip Cards**: Interactive feature cards that flip 180° in 3D to reveal deep capability overviews and direct workspace launch buttons.
- **Cursor-Following Research Vessel**: Interactive oceanographic ship sprite with **8-directional movement physics** that steers and cruises toward user cursor interactions, generating realistic bow waves and stern wake trails.
- **Top-Down Ocean Aerial Backdrop**: High-resolution repeating marine texture with ambient bioluminescent lighting and wave refraction.
- **Live System Telemetry Bar**: Real-time metrics tracking total logged sensor readings, commercial biomass harvested, matched genetic barcodes, and database health.

### 5. Dual Persona System
posAIdon tailors its analytics and visual representations to the user's role:
- **🔬 Marine Researcher Mode**: Deep raw sensor telemetry, molecular gene marker details, sequence alignments, and custom spatial coordinate boundaries.
- **🏛️ Policy Maker Mode**: High-level sustainability indicators, regional heatwave warnings, catch decline alerts, and ecological quota recommendations.

---

## 💡 Benefits to Stakeholders

### For Marine Researchers & Scientists
- **Eliminate Manual Silo Merging**: Replaces weeks of spreadsheet cross-referencing with instant spatial-temporal correlation across physics, catch, and genetics.
- **Ground-Truth Molecular Findings**: Correlate eDNA sequence detections with real-time physical ocean conditions (temperature, depth, oxygen) to understand ecological niches.
- **Monitor Biodiversity Baselines**: Track rare, invasive, or endangered species in the Arabian Sea and Indian Ocean using non-invasive environmental DNA sampling.
- **Accelerate Climate Research**: Leverage machine learning models to observe warming trends and predict long-term migration of marine fauna.

### For Governors, Marine Regulators & Policy Makers
- **Proactive Fisheries Quotas**: Transition from reactive catch limits to predictive, climate-adjusted quotas before critical stock depletion occurs.
- **Marine Heatwave Risk Management**: Receive automated AI alerts when sea surface warming threatens regional fish stocks and coastal livelihoods.
- **Targeted Marine Protected Areas (MPAs)**: Identify high-biodiversity hotspots that require immediate conservation using combined eDNA and fisheries data.
- **Evidence-Based Blue Economy Governance**: Formulate maritime policies supported by transparent, real-time data verification.

---

## 🏗️ System Architecture

```
                               ┌─────────────────────────┐
                               │   Vite + React (5173)   │
                               │  Tailwind CSS + Leaflet │
                               └────────────┬────────────┘
                                            │ /api
                               ┌────────────▼────────────┐
                               │  Node.js Express (5000) │
                               │   REST API + Ingestion  │
                               └───────┬─────────┬───────┘
                                       │         │
                   ┌───────────────────┴───┐     └───────────────────┐
                   │                       │                         │
        ┌──────────▼──────────┐ ┌──────────▼──────────┐   ┌──────────▼──────────┐
        │   MongoDB (27017)   │ │    Redis (6379)     │   │ AI Service (8000)   │
        │ Unified Data Store  │ │ Spatial Cache & TTL │   │ FastAPI + BioPython │
        └─────────────────────┘ └─────────────────────┘   └─────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Leaflet, React-Leaflet, Recharts, Lucide Icons, React Query |
| **Backend API** | Node.js, Express.js, Mongoose, Redis client, Multer, Fast-CSV, Express Rate Limit |
| **AI / Genomics** | Python 3.10+, FastAPI, BioPython, scikit-learn, Pandas, NumPy, Uvicorn |
| **Databases** | MongoDB (Primary Document Store), Redis (Geospatial Cache & Summary TTL) |
| **DevOps** | Docker, Docker Compose v2 |

---

## 🚀 Getting Started

### 1. Running with Docker Compose (Recommended)

Make sure you have [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2 installed.

From the repository root:

```bash
docker-compose up --build
```

> **Note**: The first build of `ai-service` compiles BioPython and scikit-learn and may take 2–3 minutes.

#### Service Access URLs:
| Service | URL | Description |
| --- | --- | --- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Main user interface |
| **Backend API Health** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | API & DB status |
| **AI Service Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI |
| **MongoDB** | `localhost:27017` | Document database |
| **Redis** | `localhost:6379` | Geospatial cache |

To stop all services:
```bash
docker-compose down
```

---

### 2. Local Development Setup (Without Docker)

Ensure you have **Node.js (v18+)**, **Python (v3.10+)**, **MongoDB**, and **Redis** running locally.

#### A. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### B. AI Service Setup
```bash
cd ai-service
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### C. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 API Reference

### Data & Spatial Query Endpoints
- `GET /api/health` — Returns status of MongoDB, Redis, and AI Service connections.
- `GET /api/data/unified-spatial` — Queries oceanography, fisheries, and eDNA data within a given radius (`lat`, `lng`, `radiusKm`, `startDate`, `endDate`).
- `GET /api/data/summary` — Returns national marine metric totals (observations, catch kg, eDNA matches).

### Ingestion Endpoints (Multipart Form)
- `POST /api/ingest/ocean` — Ingests physical ocean sensor CSV.
- `POST /api/ingest/fisheries` — Ingests commercial fisheries catch log CSV.
- `POST /api/ingest/edna` — Ingests eDNA CSV or FASTA sequence file (`file`, `lat`, `lng`, `markerType`).

### AI & Genomics Endpoints
- `POST /api/predict-impact` — Computes predicted catch percentage changes based on temperature anomalies.
- `POST /fasta/parse` (AI Service) — Validates sequence strings, extracts GC content, and identifies taxonomic markers.

---

## 📁 Project Directory Structure

```
Oceanographic-Insights/
├── docker-compose.yml              # Multi-container orchestration
├── README.md                       # Master documentation
├── sample-data/                    # Reference CSVs & sample FASTA files
│   ├── sample_ocean.csv
│   ├── sample_fisheries.csv
│   └── sample_edna.fasta
│
├── frontend/                       # React 18 + Vite frontend
│   ├── public/
│   │   ├── favicon.svg             # Marine vector favicon
│   │   ├── ocean-topdown.jpg       # Seamless aerial ocean texture
│   │   └── ship/                   # 8-directional vessel sprites
│   └── src/
│       ├── components/
│       │   ├── home/               # Homepage, 3D cards, Ship canvas
│       │   ├── map/                # Leaflet GIS workspace & modals
│       │   ├── analytics/          # Recharts AI insight graphs
│       │   ├── upload/             # Multi-silo ingestion portal
│       │   └── layout/             # Top navbar & sidebar filters
│       ├── context/                # Dashboard state & persona management
│       └── hooks/                  # React Query API integrations
│
├── backend/                        # Node.js + Express backend
│   ├── config/                     # MongoDB & Redis clients
│   ├── controllers/                # Ingest, query, and AI controllers
│   ├── models/                     # OceanData, FisheryData, EdnaData schemas
│   ├── routes/                     # REST API route handlers
│   └── server.js                   # Express server entrypoint
│
└── ai-service/                     # Python FastAPI AI microservice
    ├── routes/                     # FASTA parser & prediction endpoints
    ├── services/                   # BioPython & scikit-learn impact models
    ├── schemas.py                  # Pydantic validation schemas
    └── main.py                     # FastAPI application entrypoint
```

---

## 📄 License & Attribution

Built for **Smart India Hackathon (SIH)** — Problem Statement 20.  
Designed and developed for advancing marine scientific research and sustainable ocean governance.
