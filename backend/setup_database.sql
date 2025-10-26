-- This is the only script you need to run on your database.

-- Step 1: Drop all existing tables to ensure a clean slate
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS case_records CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;


-- Step 2: Create the tables with the correct, final schema

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL
);

CREATE TABLE patients (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dob DATE NOT NULL
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    street VARCHAR NOT NULL,
    zip VARCHAR NOT NULL,
    state VARCHAR NOT NULL
);

CREATE TABLE case_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    diag_date DATE NOT NULL,
    status VARCHAR NOT NULL
);

CREATE TABLE vaccinations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    date DATE NOT NULL,
    vaccine_type VARCHAR NOT NULL
);

-- Step 3: Insert all the data into the newly created tables

-- Insert Admin User (id will be 1)
INSERT INTO users (first_name, last_name, name, email, password, role) VALUES
('Admin', 'User', 'Admin User', 'admin@covid.com', 'admin123', 'admin');

-- Insert Patient Users (ids will start from 2)
INSERT INTO users (first_name, last_name, name, email, password, role) VALUES
('Aarav', 'Sharma', 'Aarav Sharma', '9876543210@patient.local', '9876543210', 'patient'),
('Vihaan', 'Verma', 'Vihaan Verma', '9876543211@patient.local', '9876543211', 'patient'),
('Aditya', 'Singh', 'Aditya Singh', '9876543212@patient.local', '9876543212', 'patient'),
('Sai', 'Patel', 'Sai Patel', '9876543213@patient.local', '9876543213', 'patient'),
('Arjun', 'Kumar', 'Arjun Kumar', '9876543214@patient.local', '9876543214', 'patient'),
('Diya', 'Gupta', 'Diya Gupta', '9876543215@patient.local', '9876543215', 'patient'),
('Ananya', 'Reddy', 'Ananya Reddy', '9876543216@patient.local', '9876543216', 'patient'),
('Priya', 'Mehta', 'Priya Mehta', '9876543217@patient.local', '9876543217', 'patient'),
('Ishaan', 'Jain', 'Ishaan Jain', '9876543218@patient.local', '9876543218', 'patient'),
('Rohan', 'Das', 'Rohan Das', '9876543219@patient.local', '9876543219', 'patient');

-- Insert Patient details
INSERT INTO patients (id, dob)
SELECT id,
    ('1970-01-01'::date + (random() * 365 * 40)::int * '1 day'::interval)
FROM users WHERE role = 'patient';

-- Insert Locations
INSERT INTO locations (name, address, street, zip, state) VALUES
('Apollo Hospital', 'Greams Road', 'Off Greams Road', '600006', 'Tamil Nadu'),
('Fortis Hospital', 'Mulund Goregaon Link Road', 'Mulund West', '400078', 'Maharashtra'),
('Medanta The Medicity', 'Sector 38', 'CH Baktawar Singh Road', '122001', 'Haryana'),
('AIIMS Delhi', 'Ansari Nagar', 'Ansari Nagar East', '110029', 'Delhi'),
('Narayana Health City', 'Bommasandra Industrial Area', 'Hosur Road', '560099', 'Karnataka');

-- Insert Case Records
INSERT INTO case_records (patient_id, location_id, diag_date, status)
SELECT
    p.id,
    l.id,
    NOW() - (floor(random() * 365) || ' days')::interval,
    CASE floor(random() * 3)
        WHEN 0 THEN 'active'
        WHEN 1 THEN 'recovered'
        ELSE 'death'
    END
FROM
    (SELECT id FROM patients ORDER BY random() LIMIT 5) p,
    (SELECT id FROM locations ORDER BY random() LIMIT 5) l;

-- Insert Vaccination Records
WITH first_doses AS (
    INSERT INTO vaccinations (patient_id, date, vaccine_type)
    SELECT
        p.id,
        NOW() - (floor(random() * 500) || ' days')::interval,
        CASE floor(random() * 3)
            WHEN 0 THEN 'Covishield'
            WHEN 1 THEN 'Covaxin'
            ELSE 'Sputnik V'
        END
    FROM
        (SELECT id FROM patients ORDER BY random() LIMIT 5) p
    RETURNING patient_id, date, vaccine_type
)
INSERT INTO vaccinations (patient_id, date, vaccine_type)
SELECT
    patient_id,
    date + '28 days'::interval,
    vaccine_type
FROM
    first_doses;