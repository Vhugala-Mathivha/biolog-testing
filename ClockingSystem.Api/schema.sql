-- BioLog database schema
-- Run this against your Aiven PostgreSQL instance to create the tables
-- that Entity Framework Core expects.

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Employees ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee (
    employeenumber  TEXT PRIMARY KEY,
    firstname       TEXT NOT NULL,
    lastname        TEXT NOT NULL,
    idnumber        TEXT NOT NULL,
    position        TEXT,
    department      TEXT,
    contactnumber   TEXT,
    email           TEXT,
    gender          TEXT,
    facevector      VECTOR(128),
    isactive        BOOLEAN NOT NULL DEFAULT TRUE,
    createdat       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Attendance Logs ──────────────────────────────────────────────────
-- One row per work session: starttime set on clock-in, endtime set on
-- clock-out. Duration and status are computed and persisted.
CREATE TABLE IF NOT EXISTS attendancelog (
    id              SERIAL PRIMARY KEY,
    employeenumber  TEXT NOT NULL,
    starttime       TIMESTAMP WITHOUT TIME ZONE,
    endtime         TIMESTAMP WITHOUT TIME ZONE,
    duration        INTERVAL,
    status          TEXT NOT NULL DEFAULT 'Absent',
    graceperiodmins INTEGER NOT NULL DEFAULT 15
);

-- ── Security Alerts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS securityalert (
    id              SERIAL PRIMARY KEY,
    employeenumber  TEXT,
    alerttype       TEXT NOT NULL,
    message         TEXT,
    snapshoturl     TEXT,
    isresolved      BOOLEAN NOT NULL DEFAULT FALSE,
    createdat       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Admins / Portal Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin (
    id              SERIAL PRIMARY KEY,
    employeenumber  TEXT,
    passwordhash    TEXT NOT NULL,
    fullname        TEXT NOT NULL,
    role            TEXT NOT NULL,
    isactivated     BOOLEAN NOT NULL DEFAULT FALSE,
    createdat       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
