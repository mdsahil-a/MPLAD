-- MPLAD Anomaly Detection System (SIH26102) Database Schema

DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Administrator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    work VARCHAR(255) NOT NULL,
    mp VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    location VARCHAR(150),
    sanctioned NUMERIC(14,2) NOT NULL,
    spent NUMERIC(14,2) DEFAULT 0,
    estimated_cost NUMERIC(14,2),
    actual_cost NUMERIC(14,2),
    progress INT DEFAULT 0,
    delay_days INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In Progress',
    fin_signal INT DEFAULT 0,
    net_signal INT DEFAULT 0,
    dup_signal INT DEFAULT 0,
    photo_signal INT DEFAULT 0,
    risk INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    risk VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
