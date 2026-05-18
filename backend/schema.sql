-- backend/schema.sql
-- PostgreSQL-compatible schema. Run these commands in `psql` as a user with
-- permission to create databases, or run the CREATE TABLE statements inside
-- an existing database.

-- To create the database and connect to it in psql:
-- CREATE DATABASE mobile_voting;
-- \c mobile_voting

CREATE TABLE IF NOT EXISTS voters (
    id SERIAL PRIMARY KEY,
    epic VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    aadhaar VARCHAR(12) UNIQUE NOT NULL,
    faceRegistered BOOLEAN DEFAULT FALSE,
    votedFor VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    epic VARCHAR(20) NOT NULL,
    candidateId VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (epic) REFERENCES voters(epic)
);
