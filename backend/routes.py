from flask import Blueprint, jsonify, request
from models import db, User, Patient, Location, CaseRecord, Vaccination
from services import get_arima_predictions, get_aggregated_states_data
import datetime

api = Blueprint('api', __name__)

# --- UNIFIED LOGIN ROUTE (Corrected Logic) ---
@api.route('/login', methods=['POST'])
def login():
    data = request.json
    password = data.get('password')

    # Patient Login attempt (using 'contact')
    contact = data.get('contact')
    if contact:
        patient_email = f"{contact.strip()}@patient.local"
        user = User.query.filter_by(email=patient_email).first()
        # Check for user, password match, and correct role
        if user and user.password == password and user.role == 'patient':
            return jsonify({"role": "patient", "id": user.id, "name": user.name})

    # Admin Login attempt (using 'email')
    email = data.get('email')
    if email:
        user = User.query.filter_by(email=email.strip()).first()
        # Check for user, password match, and correct role
        if user and user.password == password and user.role == 'admin':
            return jsonify({"role": "admin", "email": user.email, "name": user.name})

    # If all checks fail
    return jsonify({"error": "Invalid credentials"}), 401


# --- Patient Routes (Modified) ---
@api.route('/patients', methods=['GET', 'POST'])
def handle_patients():
    if request.method == 'POST':
        data = request.json
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            name=f"{data['first_name']} {data['last_name']}",
            email=f"{data['contact']}@patient.local",
            password=data['contact'],
            role='patient'
        )
        db.session.add(new_user)
        db.session.flush()

        new_patient = Patient(
            id=new_user.id,
            dob=datetime.datetime.strptime(data['dob'], '%Y-%m-%d').date()
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify({"message": "Patient created"}), 201

    patients = db.session.query(User, Patient).join(Patient, User.id == Patient.id).order_by(User.name).all()
    return jsonify([{
        "id": p.User.id, "name": p.User.name, "first_name": p.User.first_name, "last_name": p.User.last_name,
        "contact": p.User.email.split('@')[0], "dob": p.Patient.dob.isoformat()
    } for p in patients])

@api.route('/patients/<int:patient_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_patient(patient_id):
    user = User.query.get_or_404(patient_id)
    if user.role != 'patient':
        return jsonify({"error": "Not a patient"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id, "name": user.name, "first_name": user.first_name, "last_name": user.last_name,
            "contact": user.email.split('@')[0], "dob": user.patient.dob.isoformat()
        })
    
    if request.method == 'PUT':
        data = request.json
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.name = f"{data.get('first_name', user.first_name)} {data.get('last_name', user.last_name)}"
        user.email = f"{data['contact']}@patient.local" if 'contact' in data else user.email
        user.patient.dob = datetime.datetime.strptime(data['dob'], '%Y-%m-%d').date() if 'dob' in data else user.patient.dob
        db.session.commit()
        return jsonify({"message": "Patient updated"})
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Patient deleted"}), 204

# --- Location, CaseRecord, Vaccination, and Prediction Routes ---

@api.route('/locations', methods=['GET', 'POST'])
def handle_locations():
    if request.method == 'POST':
        data = request.json
        new_location = Location(**data)
        db.session.add(new_location)
        db.session.commit()
        return jsonify({"message": "Location created"}), 201

    locations = Location.query.order_by(Location.name).all()
    return jsonify([{"id": l.id, "name": l.name, "address": l.address, "street": l.street, "zip": l.zip, "state": l.state} for l in locations])

@api.route('/locations/<int:loc_id>', methods=['PUT', 'DELETE'])
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

    records = db.session.query(CaseRecord, User.name, Location.name.label("location_name"), Location.state)\
        .join(Patient, CaseRecord.patient_id == Patient.id)\
        .join(User, Patient.id == User.id)\
        .join(Location, CaseRecord.location_id == Location.id)\
        .order_by(CaseRecord.diag_date.desc()).all()
        
    return jsonify([{
        "id": r.CaseRecord.id, "patient_id": r.CaseRecord.patient_id, "location_id": r.CaseRecord.location_id,
        "diag_date": r.CaseRecord.diag_date.isoformat(), "status": r.CaseRecord.status,
        "patients": {"name": r.name}, "locations": {"name": r.location_name, "state": r.state}
    } for r in records])

@api.route('/case_records/patient/<int:patient_id>', methods=['GET'])
def get_cases_for_patient(patient_id):
    records = db.session.query(CaseRecord, Location.name, Location.address, Location.state)\
        .join(Location, CaseRecord.location_id == Location.id)\
        .filter(CaseRecord.patient_id == patient_id)\
        .order_by(CaseRecord.diag_date.desc()).all()
    
    return jsonify([{
        "id": r.CaseRecord.id, "diag_date": r.CaseRecord.diag_date.isoformat(), "status": r.CaseRecord.status,
        "locations": {"name": r.name, "address": r.address, "state": r.state}
    } for r in records])

@api.route('/case_records/<int:rec_id>', methods=['PUT', 'DELETE'])
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

    vax_records = db.session.query(Vaccination, User.name)\
        .join(Patient, Vaccination.patient_id == Patient.id)\
        .join(User, Patient.id == User.id)\
        .order_by(Vaccination.date.desc()).all()
        
    return jsonify([{
        "id": r.Vaccination.id, "patient_id": r.Vaccination.patient_id,
        "date": r.Vaccination.date.isoformat(), "vaccine_type": r.Vaccination.vaccine_type,
        "patients": {"name": r.name}
    } for r in vax_records])

@api.route('/vaccinations/patient/<int:patient_id>', methods=['GET'])
def get_vax_for_patient(patient_id):
    records = Vaccination.query.filter_by(patient_id=patient_id).order_by(Vaccination.date.desc()).all()
    return jsonify([{"id": r.id, "date": r.date.isoformat(), "vaccine_type": r.vaccine_type} for r in records])

@api.route('/vaccinations/<int:vax_id>', methods=['PUT', 'DELETE'])
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

@api.route('/stats/states', methods=['GET'])
def get_state_stats():
    try:
        agg_df = get_aggregated_states_data()
        return jsonify(agg_df.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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