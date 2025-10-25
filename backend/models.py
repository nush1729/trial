from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
import uuid

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)  # In production, this should be hashed
    role = db.Column(db.String, nullable=False, default='user')


class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, unique=True, nullable=False)
    dob = db.Column(db.Date, nullable=False)
    case_records = db.relationship('CaseRecord', backref='patient', lazy=True, cascade="all, delete-orphan")
    vaccinations = db.relationship('Vaccination', backref='patient', lazy=True, cascade="all, delete-orphan")


class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    street = db.Column(db.String, nullable=False)
    zip = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)
    case_records = db.relationship('CaseRecord', backref='location', lazy=True)


class CaseRecord(db.Model):
    __tablename__ = 'case_records'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'), nullable=False)
    location_id = db.Column(UUID(as_uuid=True), db.ForeignKey('locations.id'), nullable=False)
    diag_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String, nullable=False)  # Expected values: 'active', 'recovered', 'death'


class Vaccination(db.Model):
    __tablename__ = 'vaccinations'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    vaccine_type = db.Column(db.String, nullable=False)

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False) # In production, this should be hashed
    role = db.Column(db.String, nullable=False, default='user')

class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, unique=True, nullable=False)
    dob = db.Column(db.Date, nullable=False)
    case_records = db.relationship('CaseRecord', backref='patient', lazy=True, cascade="all, delete-orphan")
    vaccinations = db.relationship('Vaccination', backref='patient', lazy=True, cascade="all, delete-orphan")

class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    street = db.Column(db.String, nullable=False)
    zip = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)
    case_records = db.relationship('CaseRecord', backref='location', lazy=True)

class CaseRecord(db.Model):
    __tablename__ = 'case_records'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'), nullable=False)
    location_id = db.Column(UUID(as_uuid=True), db.ForeignKey('locations.id'), nullable=False)
    diag_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String, nullable=False) # Expected values: 'active', 'recovered', 'death'

class Vaccination(db.Model):
    __tablename__ = 'vaccinations'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    vaccine_type = db.Column(db.String, nullable=False)