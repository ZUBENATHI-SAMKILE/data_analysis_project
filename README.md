# DataSphere — Full-Stack Kaggle Analytics Platform

<div align="center">

![DataSphere](https://img.shields.io/badge/DataSphere-Analytics%20Platform-1a56db?style=for-the-badge&logo=databricks&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

**A production-grade data analysis platform with AI-powered insights, machine learning dashboards, SQL showcases, and real-time Kaggle dataset exploration.**

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [API Reference](#api-reference)

</div>

---

## Overview

DataSphere is a full-stack web application that demonstrates end-to-end data analysis and software engineering skills. It connects a **React frontend** with a **Node.js/Express backend** to deliver interactive data exploration, machine learning model comparisons, SQL query showcases, and an AI analyst powered by Groq (Llama 3.3 70B) — all in a clean, professional dashboard interface.

---

## Features

### Dataset Explorer
- Browse and filter 4 pre-loaded Kaggle datasets
- Live metric cards (survival rate, average price, profit margin, etc.)
- Interactive charts: bar, scatter, histogram, doughnut
- Sortable, searchable, paginated data table
- Column type inspector with auto-detected schema

### Machine Learning Dashboard
- Compare 3 models per dataset (Random Forest, Logistic Regression, XGBoost, etc.)
- Accuracy, Precision, Recall, F1, AUC-ROC metrics
- Confusion matrix with TP / FP / FN / TN breakdown
- SHAP feature importances visualised as bar charts
- ROC curve (classification) or R² comparison (regression)
- Full model comparison table with rank badges

### SQL Showcase
- Syntax-highlighted SQL queries per dataset
- Window functions, CTEs, aggregations, RANK()
- Live query result tables with insight callouts

### AI Analyst
- Real-time streaming chat powered by Groq (Llama 3.3 70B)
- Dataset-aware context injected into every prompt
- Suggested questions per dataset
- Server-side API key — never exposed to the browser
- SSE (Server-Sent Events) streaming via Node.js proxy

### CSV Upload
- Drag & drop or click-to-browse CSV upload (up to 10MB)
- Auto type detection (integer, float, string, date)
- Instant descriptive statistics per column
- Preview table, column inspector, and auto-generated charts
- Session upload history with delete

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | Component-based UI with hooks |
| React Router v6 | Client-side routing (6 pages) |
| Chart.js + react-chartjs-2 | Bar, scatter, line, doughnut charts |
| Lucide React | Icon library |
| Vite 5 | Dev server + build tool |
| CSS Variables | Design token system (no CSS framework needed) |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| Groq SDK | LLM streaming via Llama 3.3 70B |
| Multer | CSV file upload handling |
| Helmet | Security headers |
| express-rate-limit | Rate limiting (120 req/min, 10/min for AI) |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |

---
## API Reference

### Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/datasets` | List all dataset metadata |
| `GET` | `/api/datasets/:id` | Get rows with filter / sort / pagination |
| `GET` | `/api/datasets/:id/stats` | Descriptive statistics per column |

#### Query Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `page` | `?page=2` | Page number (default: 1) |
| `limit` | `?limit=100` | Rows per page (max: 200) |
| `sort_col` | `?sort_col=Age` | Column to sort by |
| `sort_dir` | `?sort_dir=desc` | `asc` or `desc` |
| `filter_col` | `?filter_col=Sex` | Column to filter on |
| `filter_val` | `?filter_val=female` | Value to filter by |
| `filter_op` | `?filter_op=eq` | `eq` `neq` `gt` `gte` `lt` `lte` `contains` |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analysis/:id/summary` | Key metric card values |
| `GET` | `/api/analysis/:id/charts` | Pre-computed chart datasets |
| `GET` | `/api/analysis/:id/ml` | ML model metrics and feature importances |
| `GET` | `/api/analysis/:id/sql` | SQL query showcase data |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/analyse` | Streaming SSE response |
| `POST` | `/api/ai/analyse-sync` | Synchronous response (fallback) |


### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload CSV (multipart/form-data, field: `file`) |
| `GET` | `/api/upload` | List all uploaded datasets |
| `GET` | `/api/upload/:id` | Get rows of an uploaded dataset |
| `DELETE` | `/api/upload/:id` | Delete an uploaded dataset |

---

## Available Datasets

| ID | Name | Rows | Cols | Task |
|----|------|------|------|------|
| `titanic` | Titanic — ML from Disaster | 891 | 12 | Binary classification |
| `iris` | Iris Species | 150 | 5 | Multiclass classification |
| `housing` | House Prices — Ames | 1,460 | 81 | Regression |
| `sales` | Global Superstore Sales | 9,994 | 21 | Business analytics |

---

## Skills Demonstrated

| Skill | Implementation |
|-------|---------------|
| **React 18 hooks** | `useFetch`, `useState`, `useEffect`, `useRef`, `useCallback` |
| **React Router v6** | 6-page SPA with `useSearchParams`, `useNavigate`, `NavLink` |
| **REST API design** | Express with filtering, sorting, pagination, error handling |
| **Data Visualisation** | Chart.js — bar, scatter, line, doughnut, histogram |
| **Machine Learning** | Model metrics, confusion matrix, SHAP importances, ROC curve |
| **SQL Engineering** | Window functions, CTEs, aggregations, RANK(), PERCENTILE_CONT() |
| **AI / LLM Integration** | Groq streaming via SSE, server-side key proxy |
| **File handling** | Multer CSV upload, in-memory parsing, auto type detection |
| **Security** | Helmet, CORS, rate limiting, environment variable management |
| **UI / UX** | Design tokens, skeleton loaders, responsive layout, Lucide icons |

---

## Deployment

### Frontend → Vercel

```bash
cd datasphere-frontend
npm run build
```

### Backend → Render

1. Push `datasphere-backend/` to GitHub
2. Connect to [Render](https://render.com) 
3. Add environment variables: `GROQ_API_KEY`, `FRONTEND_URL`, `PORT`
4. Deploy

---

## License

MIT — free to use, modify and distribute.

---

<div align="center">
Built with React · Node.js · Express · Chart.js · Groq AI · Lucide Icons
</div>