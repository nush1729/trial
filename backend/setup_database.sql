-- This is the only script you need to run on your database.

-- Step 1: Drop all existing tables to ensure a clean slate
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS case_records CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Step 2: Enable UUID functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create the tables with the correct, final schema

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL
);

CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dob DATE NOT NULL
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    street VARCHAR NOT NULL,
    zip VARCHAR NOT NULL,
    state VARCHAR NOT NULL
);

CREATE TABLE case_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    diag_date DATE NOT NULL,
    status VARCHAR NOT NULL
);

CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    date DATE NOT NULL,
    vaccine_type VARCHAR NOT NULL
);

-- Step 4: Insert all the data into the newly created tables

-- Insert Admin User
INSERT INTO users (id, first_name, last_name, name, email, password, role) VALUES
(uuid_generate_v4(), 'Admin', 'User', 'Admin User', 'admin@covid.com', 'admin123', 'admin');

-- Insert Patient Users
INSERT INTO users (id, first_name, last_name, name, email, password, role) VALUES
(uuid_generate_v4(), 'Aarav', 'Sharma', 'Aarav Sharma', '9876543210@patient.local', '9876543210', 'patient'),
(uuid_generate_v4(), 'Vihaan', 'Verma', 'Vihaan Verma', '9876543211@patient.local', '9876543211', 'patient'),
(uuid_generate_v4(), 'Aditya', 'Singh', 'Aditya Singh', '9876543212@patient.local', '9876543212', 'patient'),
(uuid_generate_v4(), 'Sai', 'Patel', 'Sai Patel', '9876543213@patient.local', '9876543213', 'patient'),
(uuid_generate_v4(), 'Arjun', 'Kumar', 'Arjun Kumar', '9876543214@patient.local', '9876543214', 'patient'),
(uuid_generate_v4(), 'Diya', 'Gupta', 'Diya Gupta', '9876543215@patient.local', '9876543215', 'patient'),
(uuid_generate_v4(), 'Ananya', 'Reddy', 'Ananya Reddy', '9876543216@patient.local', '9876543216', 'patient'),
(uuid_generate_v4(), 'Priya', 'Mehta', 'Priya Mehta', '9876543217@patient.local', '9876543217', 'patient'),
(uuid_generate_v4(), 'Ishaan', 'Jain', 'Ishaan Jain', '9876543218@patient.local', '9876543218', 'patient'),
(uuid_generate_v4(), 'Rohan', 'Das', 'Rohan Das', '9876543219@patient.local', '9876543219', 'patient'),
(uuid_generate_v4(), 'Saanvi', 'Mishra', 'Saanvi Mishra', '9876543220@patient.local', '9876543220', 'patient'),
(uuid_generate_v4(), 'Kabir', 'Khan', 'Kabir Khan', '9876543221@patient.local', '9876543221', 'patient'),
(uuid_generate_v4(), 'Vivaan', 'Shah', 'Vivaan Shah', '9876543222@patient.local', '9876543222', 'patient'),
(uuid_generate_v4(), 'Myra', 'Chopra', 'Myra Chopra', '9876543223@patient.local', '9876543223', 'patient'),
(uuid_generate_v4(), 'Aanya', 'Yadav', 'Aanya Yadav', '9876543224@patient.local', '9876543224', 'patient'),
(uuid_generate_v4(), 'Krishna', 'Nair', 'Krishna Nair', '9876543225@patient.local', '9876543225', 'patient'),
(uuid_generate_v4(), 'Zara', 'Malhotra', 'Zara Malhotra', '9876543226@patient.local', '9876543226', 'patient'),
(uuid_generate_v4(), 'Advik', 'Bose', 'Advik Bose', '9876543227@patient.local', '9876543227', 'patient'),
(uuid_generate_v4(), 'Ishita', 'Rao', 'Ishita Rao', '9876543228@patient.local', '9876543228', 'patient'),
(uuid_generate_v4(), 'Arnav', 'Iyer', 'Arnav Iyer', '9876543229@patient.local', '9876543229', 'patient');

-- Insert Patient details
INSERT INTO patients (id, dob)
SELECT id, 
    ('1970-01-01'::date + (random() * 365 * 40)::int * '1 day'::interval)
FROM users WHERE role = 'patient';

-- Insert Locations
INSERT INTO locations (id, name, address, street, zip, state) VALUES
(uuid_generate_v4(), 'Apollo Hospital', 'Greams Road', 'Off Greams Road', '600006', 'Tamil Nadu'),
(uuid_generate_v4(), 'Fortis Hospital', 'Mulund Goregaon Link Road', 'Mulund West', '400078', 'Maharashtra'),
(uuid_generate_v4(), 'Medanta The Medicity', 'Sector 38', 'CH Baktawar Singh Road', '122001', 'Haryana'),
(uuid_generate_v4(), 'AIIMS Delhi', 'Ansari Nagar', 'Ansari Nagar East', '110029', 'Delhi'),
(uuid_generate_v4(), 'Narayana Health City', 'Bommasandra Industrial Area', 'Hosur Road', '560099', 'Karnataka'),
(uuid_generate_v4(), 'CMC Vellore', 'Ida Scudder Road', 'Vellore', '632004', 'Tamil Nadu'),
(uuid_generate_v4(), 'PGIMER Chandigarh', 'Sector 12', 'Madhya Marg', '160012', 'Chandigarh'),
(uuid_generate_v4(), 'Lilavati Hospital', 'Bandra Reclamation', 'Bandra West', '400050', 'Maharashtra'),
(uuid_generate_v4(), 'KIMS Hospital', 'Minister Road', 'Secunderabad', '500003', 'Telangana'),
(uuid_generate_v4(), 'AMRI Hospital', 'JC Block', 'Salt Lake City', '700098', 'West Bengal'),
(uuid_generate_v4(), 'Jaslok Hospital', 'Pedder Road', 'Dr. G Deshmukh Marg', '400026', 'Maharashtra'),
(uuid_generate_v4(), 'Manipal Hospital', 'HAL Airport Road', 'Old Airport Road', '560017', 'Karnataka'),
(uuid_generate_v4(), 'Sankara Nethralaya', 'College Road', 'Nungambakkam', '600006', 'Tamil Nadu'),
(uuid_generate_v4(), 'Max Healthcare', 'Saket', 'Press Enclave Marg', '110017', 'Delhi'),
(uuid_generate_v4(), 'Global Hospital', 'Parel', 'Dr. E Borges Road', '400012', 'Maharashtra'),
(uuid_generate_v4(), 'Aster CMI Hospital', 'Hebbal', 'New Airport Road', '560092', 'Karnataka'),
(uuid_generate_v4(), 'Kokilaben Hospital', 'Andheri West', 'Four Bungalows', '400053', 'Maharashtra'),
(uuid_generate_v4(), 'MIOT International', 'Manapakkam', 'Mount Poonamallee Road', '600089', 'Tamil Nadu'),
(uuid_generate_v4(), 'Ruby Hall Clinic', 'Sassoon Road', 'Pune', '411001', 'Maharashtra'),
(uuid_generate_v4(), 'Continental Hospital', 'Gachibowli', 'Financial District', '500032', 'Telangana');

-- Insert Case Records
INSERT INTO case_records (id, patient_id, location_id, diag_date, status)
SELECT
    uuid_generate_v4(),
    p.id,
    l.id,
    NOW() - (floor(random() * 365) || ' days')::interval,
    CASE floor(random() * 3)
        WHEN 0 THEN 'active'
        WHEN 1 THEN 'recovered'
        ELSE 'death'
    END
FROM
    (SELECT id FROM patients ORDER BY random() LIMIT 20) p,
    (SELECT id FROM locations ORDER BY random() LIMIT 20) l;

-- Insert Vaccination Records
WITH first_doses AS (
    INSERT INTO vaccinations (id, patient_id, date, vaccine_type)
    SELECT
        uuid_generate_v4(),
        p.id,
        NOW() - (floor(random() * 500) || ' days')::interval,
        CASE floor(random() * 3)
            WHEN 0 THEN 'Covishield'
            WHEN 1 THEN 'Covaxin'
            ELSE 'Sputnik V'
        END
    FROM
        (SELECT id FROM patients ORDER BY random() LIMIT 10) p
    RETURNING patient_id, date, vaccine_type
)
INSERT INTO vaccinations (id, patient_id, date, vaccine_type)
SELECT
    uuid_generate_v4(),
    patient_id,
    date + '28 days'::interval,
    vaccine_type
FROM
    first_doses;