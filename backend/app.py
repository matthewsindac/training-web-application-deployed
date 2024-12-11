from flask import Flask, jsonify, request
from flask_cors import CORS
from .models import db, Employee, Certification, Trainer, TrainingSession, SessionRSVP
from datetime import datetime
from sqlalchemy import func
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

    if not Employee.query.first():
        sample_employee = Employee(name="John Doe", email="john.doe@example.com", department="Engineering")
        db.session.add(sample_employee)

    if not Trainer.query.first():
        sample_trainers = [
            {"name": "Alice Smith", "email": "alice.smith@example.com", "specialization": "Safety Training"},
            {"name": "Matthew Sindac", "email": "matthew.sindac@example.com", "specialization": "Technical Training"},
            {"name": "David Blaine", "email": "david.blaine@example.com", "specialization": "Soft Skills"},
            {"name": "LeBron James", "email": "lebron.james@example.com", "specialization": "Teamwork Training"},
            {"name": "Ja Morant", "email": "ja.morant@example.com", "specialization": "Leadership"},
            {"name": "Damian Lillard", "email": "damian.lillard@example.com", "specialization": "Communication Skills"}
        ]
        for trainer in sample_trainers:
            if not Trainer.query.filter_by(email=trainer["email"]).first():
                new_trainer = Trainer(name=trainer["name"], email=trainer["email"], specialization=trainer["specialization"])
                db.session.add(new_trainer)

    if not Certification.query.first():
        sample_certifications = [
            {"name": "First Aid Certification", "description": "Basic first aid training", "validity_period": 24},
            {"name": "CPR Certification", "description": "Certification in cardiopulmonary resuscitation", "validity_period": 12},
            {"name": "Fire Safety Certification", "description": "Training on fire prevention and safety", "validity_period": 36},
            {"name": "Leadership Training Certification", "description": "Skills development in leadership", "validity_period": 18},
            {"name": "Conflict Resolution Certification", "description": "Training on resolving workplace conflicts", "validity_period": 24},
            {"name": "Health & Safety Certification", "description": "Certification for workplace health and safety", "validity_period": 36},
            {"name": "Time Management Certification", "description": "Skills for effective time management", "validity_period": 12},
            {"name": "Project Management Certification", "description": "Fundamentals of project management", "validity_period": 24},
            {"name": "Diversity & Inclusion Training", "description": "Training on diversity and inclusion in the workplace", "validity_period": 12},
            {"name": "Customer Service Certification", "description": "Certification for delivering excellent customer service", "validity_period": 24}
        ]
        for cert in sample_certifications:
            if not Certification.query.filter_by(name=cert["name"]).first():
                new_certification = Certification(
                    name=cert["name"],
                    description=cert["description"],
                    validity_period=cert["validity_period"]
                )
                db.session.add(new_certification)

    db.session.commit()

@app.route('/')
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/api/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'employee_id': emp.employee_id,
        'name': emp.name,
        'email': emp.email,
        'department': emp.department
    } for emp in employees])

@app.route('/api/training_sessions', methods=['GET'])
def get_training_sessions():
    sessions = TrainingSession.query.all()
    if not sessions:
        return jsonify({"message": "No training sessions available", "sessions": []})

    return jsonify({
        "sessions": [{
            'session_id': session.session_id,
            'date': session.date.isoformat(),
            'duration': session.duration,
            'location': session.location,
            'trainer_id': session.trainer_id,
            'trainer': session.trainer.name,
            'certification_id': session.certification_id,
            'certification': session.certification.name if session.certification else None
        } for session in sessions]
    })


@app.route('/api/training_sessions', methods=['POST'])
def create_training_session():
    data = request.get_json()

    try:
        session_date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        new_session = TrainingSession(
            date=session_date,
            duration=int(data['duration']),
            location=data['location'],
            trainer_id=int(data['trainer_id']),
            certification_id=int(data['certification_id']) if data.get('certification_id') else None
        )

        db.session.add(new_session)
        db.session.commit()

        return jsonify({'message': 'Training session created successfully', 'session': data})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create training session', 'details': str(e)})



@app.route('/api/training_sessions/<int:session_id>', methods=['PUT'])
def update_training_session(session_id):
    session = TrainingSession.query.get_or_404(session_id)
    data = request.get_json()
    session.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    session.duration = int(data['duration'])
    session.location = data['location']
    session.trainer_id = int(data['trainer_id'])
    session.certification_id = int(data['certification_id']) if data.get('certification_id') else None
    db.session.commit()
    return jsonify({'message': 'Training session updated successfully'})

@app.route('/api/training_sessions/<int:session_id>', methods=['DELETE'])
def delete_training_session(session_id):
    session = TrainingSession.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Training session deleted successfully'})

@app.route('/api/trainers', methods=['GET'])
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify([{
        'trainer_id': trainer.trainer_id,
        'name': trainer.name
    } for trainer in trainers])

@app.route('/api/certifications', methods=['GET'])
def get_certifications():
    certifications = Certification.query.all()
    return jsonify([{
        'certification_id': cert.certification_id,
        'name': cert.name
    } for cert in certifications])


@app.route('/api/training_sessions/report', methods=['GET'])
def get_training_sessions_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    trainer_id = request.args.get('trainer_id', type=int)
    certification_id = request.args.get('certification_id', type=int)
    
    query = TrainingSession.query

    if start_date:
        query = query.filter(TrainingSession.date >= start_date)
    if end_date:
        query = query.filter(TrainingSession.date <= end_date)
    if trainer_id:
        query = query.filter(TrainingSession.trainer_id == trainer_id)
    if certification_id:
        query = query.filter(TrainingSession.certification_id == certification_id)

    sessions = query.all()

    if not sessions:
        return jsonify({
            "message": "No sessions match the given criteria",
            "sessions": [],
            "statistics": {
                "average_duration": None,
                "average_attendance": None
            }
        })

    avg_duration = query.with_entities(func.avg(TrainingSession.duration)).scalar()

    attendance_counts = (
        db.session.query(SessionRSVP.session_id, func.count(SessionRSVP.status).label("count"))
        .filter(SessionRSVP.status == "attending")
        .group_by(SessionRSVP.session_id)
        .subquery()
    )

    avg_attendance = (
        db.session.query(func.avg(attendance_counts.c.count))
        .scalar()
    )
    total_sessions = query.count()

    return jsonify({
        "sessions": [{
            'session_id': session.session_id,
            'date': session.date.isoformat(),
            'duration': session.duration,
            'location': session.location,
            'trainer': session.trainer.name,
            'certification': session.certification.name if session.certification else None
        } for session in sessions],
        "statistics": {
            "average_duration": avg_duration,
            "average_attendance": avg_attendance,
            "total_sessions": total_sessions  
        }
    })




# if __name__ == '__main__':
    

#     app.run()

