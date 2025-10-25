from flask import Blueprint, jsonify, request
from models import db, Patient, Location, CaseRecord, Vaccination, User
from services import get_arima_predictions, get_aggregated_states_data
import datetime

api = Blueprint('api', __name__)

# --- Patient Routes ---
@api.route('/patients', methods=['GET', 'POST'])
def handle_patients():
    if request.method == 'POST':
        data = request.json
        new_patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            name=f"{data['first_name']} {data['last_name']}",
            contact=data['contact'],
            dob=datetime.datetime.strptime(data['dob'], '%Y-%m-%d').date()
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify({"message": "Patient created"}), 201

    patients = Patient.query.order_by(Patient.name).all()
    return jsonify([{
        "id": str(p.id), "name": p.name, "first_name": p.first_name, "last_name": p.last_name, 
        "contact": p.contact, "dob": p.dob.isoformat()
    } for p in patients])
    
@api.route('/patients/<uuid:patient_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    if request.method == 'GET':
        return jsonify({
            "id": str(patient.id), "name": patient.name, "contact": patient.contact,
            "dob": patient.dob.isoformat()
        })
    
    if request.method == 'PUT':
        data = request.json
        patient.first_name = data.get('first_name', patient.first_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.name = f"{data.get('first_name', patient.first_name)} {data.get('last_name', patient.last_name)}"
        patient.contact = data.get('contact', patient.contact)
        patient.dob = datetime.datetime.strptime(data['dob'], '%Y-%m-%d').date() if 'dob' in data else patient.dob
        db.session.commit()
        return jsonify({"message": "Patient updated"})
    
    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient deleted"}), 204

# --- Location Routes ---
@api.route('/locations', methods=['GET', 'POST'])
def handle_locations():
    if request.method == 'POST':
        data = request.json
        new_location = Location(**data)
        db.session.add(new_location)
        db.session.commit()
        return jsonify({"message": "Location created"}), 201

    locations = Location.query.order_by(Location.name).all()
    return jsonify([{"id": str(l.id), "name": l.name, "address": l.address, "street": l.street, "zip": l.zip, "state": l.state} for l in locations])

@api.route('/locations/<uuid:loc_id>', methods=['PUT', 'DELETE'])
def handle_location(loc_id):
    location = Location.query.get_or_404(loc_id)
    if request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(location, key, value)
        db.session.commit()
        return jsonify({"message": "Location updated"})
    
    db.session.delete(location)
    db.session.commit()
    return jsonify({"message": "Location deleted"}), 204
    
# --- Case Record Routes ---
@api.route('/case_records', methods=['GET', 'POST'])
def handle_case_records():
    if request.method == 'POST':
        data = request.json
        new_record = CaseRecord(
             patient_id=data['patient_id'],
             location_id=data['location_id'],
             diag_date=datetime.datetime.strptime(data['diag_date'], '%Y-%m-%d').date(),
             status=data['status']
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify({"message": "Case record created"}), 201

    records = db.session.query(CaseRecord, Patient.name, Location.name.label("location_name"), Location.state)\
        .join(Patient, CaseRecord.patient_id == Patient.id)\
        .join(Location, CaseRecord.location_id == Location.id)\
        .order_by(CaseRecord.diag_date.desc()).all()
        
    return jsonify([{
        "id": str(r.CaseRecord.id), "patient_id": str(r.CaseRecord.patient_id), "location_id": str(r.CaseRecord.location_id),
        "diag_date": r.CaseRecord.diag_date.isoformat(), "status": r.CaseRecord.status,
        "patients": {"name": r.name}, "locations": {"name": r.location_name, "state": r.state}
    } for r in records])

@api.route('/case_records/patient/<uuid:patient_id>', methods=['GET'])
def get_cases_for_patient(patient_id):
    records = db.session.query(CaseRecord, Location.name, Location.address, Location.state)\
        .join(Location, CaseRecord.location_id == Location.id)\
        .filter(CaseRecord.patient_id == patient_id)\
        .order_by(CaseRecord.diag_date.desc()).all()
    
    return jsonify([{
        "id": str(r.CaseRecord.id), "diag_date": r.CaseRecord.diag_date.isoformat(), "status": r.CaseRecord.status,
        "locations": {"name": r.name, "address": r.address, "state": r.state}
    } for r in records])

@api.route('/case_records/<uuid:rec_id>', methods=['PUT', 'DELETE'])
def handle_case_record(rec_id):
    record = CaseRecord.query.get_or_404(rec_id)
    if request.method == 'PUT':
        data = request.json
        record.patient_id = data.get('patient_id', record.patient_id)
        record.location_id = data.get('location_id', record.location_id)
        record.status = data.get('status', record.status)
        record.diag_date = datetime.datetime.strptime(data['diag_date'], '%Y-%m-%d').date() if 'diag_date' in data else record.diag_date
        db.session.commit()
        return jsonify({"message": "Case record updated"})
    
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Case record deleted"}), 204
    
# --- Vaccination Routes ---
@api.route('/vaccinations', methods=['GET', 'POST'])
def handle_vaccinations():
    if request.method == 'POST':
        data = request.json
        new_vax = Vaccination(
             patient_id=data['patient_id'],
             date=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date(),
             vaccine_type=data['vaccine_type']
        )
        db.session.add(new_vax)
        db.session.commit()
        return jsonify({"message": "Vaccination created"}), 201

    vax_records = db.session.query(Vaccination, Patient.name)\
        .join(Patient, Vaccination.patient_id == Patient.id)\
        .order_by(Vaccination.date.desc()).all()
        
    return jsonify([{
        "id": str(r.Vaccination.id), "patient_id": str(r.Vaccination.patient_id), 
        "date": r.Vaccination.date.isoformat(), "vaccine_type": r.Vaccination.vaccine_type,
        "patients": {"name": r.name}
    } for r in vax_records])

@api.route('/vaccinations/patient/<uuid:patient_id>', methods=['GET'])
def get_vax_for_patient(patient_id):
    records = Vaccination.query.filter_by(patient_id=patient_id).order_by(Vaccination.date.desc()).all()
    return jsonify([{"id": str(r.id), "date": r.date.isoformat(), "vaccine_type": r.vaccine_type} for r in records])

@api.route('/vaccinations/<uuid:vax_id>', methods=['PUT', 'DELETE'])
def handle_vaccination(vax_id):
    vax = Vaccination.query.get_or_404(vax_id)
    if request.method == 'PUT':
        data = request.json
        vax.patient_id = data.get('patient_id', vax.patient_id)
        vax.vaccine_type = data.get('vaccine_type', vax.vaccine_type)
        vax.date = datetime.datetime.strptime(data['date'], '%Y-%m-%d').date() if 'date' in data else vax.date
        db.session.commit()
        return jsonify({"message": "Vaccination updated"})
    
    db.session.delete(vax)
    db.session.commit()
    return jsonify({"message": "Vaccination deleted"}), 204

# --- Login & Stats Routes ---
@api.route('/login/admin', methods=['POST'])
def login_admin():
    data = request.json
    if data.get('email') == 'admin@covid.com' and data.get('password') == 'admin123':
        return jsonify({"role": "admin", "email": data['email']})
    return jsonify({"error": "Invalid credentials"}), 401

@api.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.json
    patient = Patient.query.filter_by(contact=data.get('contact')).first()
    if patient:
        return jsonify({"role": "patient", "id": str(patient.id), "name": patient.name})
    return jsonify({"error": "Patient not found"}), 404
    
@api.route('/stats/dashboard', methods=['GET'])
def dashboard_stats():
    totalPatients = db.session.query(Patient).count()
    activeCases = db.session.query(CaseRecord).filter_by(status='active').count()
    recovered = db.session.query(CaseRecord).filter_by(status='recovered').count()
    deaths = db.session.query(CaseRecord).filter_by(status='death').count()
    vaccinations = db.session.query(Vaccination).count()
    return jsonify({
        "totalPatients": totalPatients,
        "activeCases": activeCases,
        "recovered": recovered,
        "deaths": deaths,
        "vaccinations": vaccinations
    })
    
# --- Prediction Routes ---
@api.route('/predict/states', methods=['GET'])
def get_states_for_prediction():
    try:
        agg_df = get_aggregated_states_data()
        states = sorted(agg_df['State'].unique().tolist())
        return jsonify(states)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/predict/<state>', methods=['GET'])
def predict_state(state):
    predictions = get_arima_predictions(state)
    if "error" in predictions:
        return jsonify(predictions), 404
    return jsonify(predictions)