# BioLog

Biometric clocking-in system — .NET 9.0 Web API backend.

## Architecture

| Layer      | Provider  | URL / Location                                   |
|------------|-----------|--------------------------------------------------|
| Frontend   | Vercel    | `https://bio-log-virid.vercel.app`               |
| Backend    | Render    | (assigned on deploy, e.g. `https://biolog-api.onrender.com`) |
| Database   | Aiven     | PostgreSQL (Aiven Cloud)                         |

The backend is a Dockerised .NET 9.0 API that talks to PostgreSQL on Aiven
and is consumed by the React/Vercel frontend.

---

## Prerequisites

- Docker (for local testing)
- `psql` or any PostgreSQL client (to initialise the Aiven database)
- A Render account
- An Aiven PostgreSQL service
- A Vercel project for the frontend

---

## 1. Database setup (Aiven)

1. Create a PostgreSQL service in Aiven.
2. Grab the **Service URI** from the Aiven dashboard — it looks like:

   ```
   postgres://avnadmin:YOUR_PASSWORD@biolog-project-biolog.b.aivencloud.com:10052/defaultdb?sslmode=require
   ```

3. Connect with `psql` and run the schema script:

   ```bash
   psql "postgres://avnadmin:YOUR_PASSWORD@biolog-project-biolog.b.aivencloud.com:10052/defaultdb?sslmode=require" \
     -f ClockingSystem.Api/schema.sql
   ```

   This creates the `employee`, `attendancelog`, `securityalert`, and `admin`
   tables plus the `vector` extension for face-recognition vectors.

---

## 2. Backend deployment (Render)

### Option A — Render Dashboard (simplest)

1. Push this repo to GitHub: `https://github.com/Katli-loves-tech/BioLog.git`
2. In the Render dashboard click **New → Web Service**.
3. Connect the GitHub repo, set the build command to:

   ```
   docker build -t biolog-api ./ClockingSystem.Api
   ```

   and the start command to:

   ```
   docker run --rm -p 8080:8080 biolog-api
   ```

   (Render auto-detects the Dockerfile, so you can also just click
   **Deploy with Docker**.)

4. Add the following **Environment Variables** (as Secrets where sensitive):

   | Key               | Value                                             | Secret? |
   |-------------------|---------------------------------------------------|---------|
   | `DATABASE_URL`    | Your full Aiven connection string (see above)     | **Yes** |
   | `JWT_KEY`         | A random string ≥ 32 chars (`openssl rand -hex 32`) | **Yes** |
   | `FRONTEND_ORIGIN` | `https://bio-log-virid.vercel.app`                | No      |
   | `JWT_ISSUER`      | `ClockingSystem`                                  | No      |
   | `JWT_AUDIENCE`    | `ClockingSystemUsers`                             | No      |

   > `PORT` is set automatically by Render — no action needed.

### Option B — `render.yaml` (infrastructure-as-code)

The `render.yaml` at the repo root defines the service.  Deploy via the
Render CLI:

```bash
render deploy --service biolog-api
```

The yaml sets `FRONTEND_ORIGIN`, `JWT_ISSUER`, and `JWT_AUDIENCE` as plain
env vars.  You still need to add `DATABASE_URL` and `JWT_KEY` as **Secrets**
in the Render dashboard.

---

## 3. Frontend configuration (Vercel)

In your Vercel project, add an environment variable:

| Key              | Value                                      |
|------------------|--------------------------------------------|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-service>.onrender.com` |

The frontend should make all API calls to `${NEXT_PUBLIC_API_URL}/api/...`.

---

## 4. Verification

After deployment, verify the connection end-to-end:

### 4.1 Health check

```bash
curl https://<your-render-service>.onrender.com/api/health
```

Expected response:

```json
{ "status": "ok", "database": "connected" }
```

### 4.2 CORS check

```bash
curl -I -H "Origin: https://bio-log-virid.vercel.app" \
  https://<your-render-service>.onrender.com/api/employees
```

The response should include:

```
Access-Control-Allow-Origin: https://bio-log-virid.vercel.app
```

### 4.3 Automated script

Run the included verification script (requires `curl`):

```bash
pwsh verify-connection.ps1 -ApiUrl https://<your-render-service>.onrender.com
```

---

## 5. API endpoints

| Method   | Route                          | Auth            | Description                        |
|----------|--------------------------------|-----------------|------------------------------------|
| POST     | `/api/auth/login`              | —               | Login, returns JWT                 |
| POST     | `/api/auth/set-password`       | —               | Activate HR invite                 |
| PUT      | `/api/auth/change-password`    | Authorized      | Change current password            |
| PUT      | `/api/auth/profile`            | Authorized      | Update full name                   |
| POST     | `/api/employees/register`      | Superadmin      | Register employee                  |
| GET      | `/api/employees`               | Superadmin, HR  | List all employees                 |
| GET      | `/api/employees/{empNo}`       | —               | Get employee details               |
| PUT      | `/api/employees/{empNo}`       | Superadmin      | Update employee                    |
| DELETE   | `/api/employees/{empNo}`       | Superadmin      | Delete employee                    |
| POST     | `/api/employees/{empNo}/promote-to-hr` | Superadmin | Create HR invite               |
| POST     | `/api/employees/{empNo}/face-vector` | Superadmin | Enroll face vector               |
| POST     | `/api/employees/{empNo}/verify-face` | —         | Verify face (cosine similarity)   |
| POST     | `/api/attendance/clock-in/{empNo}` | —           | Clock in                           |
| POST     | `/api/attendance/clock-out/{empNo}` | —          | Clock out                          |
| GET      | `/api/attendance/{empNo}`      | HR, Superadmin  | Attendance history                 |
| GET      | `/api/attendance/hours-worked/{empNo}` | HR, Superadmin | Hours worked summary         |
| GET      | `/api/reports/organisation`    | HR, Superadmin  | Department headcount report        |
| GET      | `/api/reports/hr-summary`      | HR, Superadmin  | HR dashboard summary               |
| GET      | `/api/reports/hr-summary/{empNo}` | HR, Superadmin | Per-employee history           |
| POST     | `/api/security-alerts`         | —               | Create security alert              |

---

## 6. Local development

```bash
# 1. Copy the dev connection string
cp ClockingSystem.Api/appsettings.Development.json.example \
   ClockingSystem.Api/appsettings.Development.json

# 2. Run
dotnet run --project ClockingSystem.Api
```

The API starts on `http://localhost:5173` (or the port set by `PORT`).
