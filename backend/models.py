from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employees'
    employee_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    department = db.Column(db.String(50))

class Trainer(db.Model):
    __tablename__ = 'trainers'
    trainer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    specialization = db.Column(db.String(100))

class Certification(db.Model):
    __tablename__ = 'certifications'
    certification_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    validity_period = db.Column(db.Integer)  

class TrainingSession(db.Model):
    __tablename__ = 'training_sessions'
    session_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer) 
    location = db.Column(db.String(100))

    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id'), nullable=False)
    certification_id = db.Column(db.Integer, db.ForeignKey('certifications.certification_id'), nullable=True)

    trainer = db.relationship('Trainer', backref='training_sessions')
    certification = db.relationship('Certification', backref='training_sessions')

class SessionRSVP(db.Model):
    __tablename__ = 'session_rsvp'
    rsvp_id = db.Column(db.Integer, primary_key=True)
    
    session_id = db.Column(db.Integer, db.ForeignKey('training_sessions.session_id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.employee_id'), nullable=False)
    
    status = db.Column(db.String(20))

    session = db.relationship('TrainingSession', backref='rsvps')
    employee = db.relationship('Employee', backref='rsvps')
