
from sqlalchemy import create_engine, Column, Integer, String, Float, TIMESTAMP, UniqueConstraint, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import config

Base = declarative_base()

class Schedule(Base):
    __tablename__ = 'schedules'
    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_date = Column(String, nullable=False)
    train_id = Column(Integer, nullable=False)
    final_decision = Column(String, nullable=False)
    saved_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    __table_args__ = (UniqueConstraint('schedule_date', 'train_id', name='_schedule_date_train_id_uc'),)

class OverrideLog(Base):
    __tablename__ = 'override_log'
    id = Column(Integer, primary_key=True, autoincrement=True)
    log_date = Column(String, nullable=False)
    train_id = Column(Integer, nullable=False)
    ai_prediction = Column(String, nullable=False)
    supervisor_decision = Column(String, nullable=False)
    logged_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)

class Job(Base):
    __tablename__ = 'jobs'
    job_id = Column(String, primary_key=True)
    status = Column(String, nullable=False)
    result = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Setting(Base):
    __tablename__ = 'settings'
    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)

class TrainData(Base):
    __tablename__ = 'train_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    train_id = Column(Integer, nullable=False)
    mileage_km = Column(Integer)
    rolling_stock_cert_days_remaining = Column(Integer)
    signalling_cert_days_remaining = Column(Integer)
    telecom_cert_days_remaining = Column(Integer)
    job_card_status = Column(String)
    branding_priority = Column(String)
    cleaning_status = Column(String)
    cleaning_due = Column(Boolean)
    hours_run_today = Column(Float)
    stabling_location = Column(String)
    induction_decision = Column(String)
    total_cert_days = Column(Integer)
    certs_critical = Column(Integer)
    weekday = Column(Integer)

class BrandingContract(Base):
    __tablename__ = 'branding_contracts'
    train_id = Column(Integer, primary_key=True)
    brand_name = Column(String)
    monthly_quota_hours = Column(Integer)
    penalty_per_hour_inr = Column(Integer)

class CleaningSchedule(Base):
    __tablename__ = 'cleaning_schedule'
    date = Column(String, primary_key=True)
    available_slots = Column(Integer)
    manpower_teams = Column(Integer)

class DepotTrack(Base):
    __tablename__ = 'depot_tracks'
    track_name = Column(String, primary_key=True)
    position = Column(Integer)
    accessibility_score = Column(Integer)
    has_maintenance_access = Column(Boolean)
    description = Column(String)
    status = Column(String)

def populate_default_settings(db_session):
    print("Populating default settings...")
    if db_session.query(Setting).count() > 0:
        print("Settings table is not empty. Skipping population.")
        return

    settings_to_insert = [
        Setting(key='FITNESS_WEIGHTS', value=str(config.FITNESS_WEIGHTS)),
        Setting(key='CERTS_CRITICAL_PENALTY', value=str(config.CERTS_CRITICAL_PENALTY)),
        Setting(key='MAINTENANCE_NEEDED_PENALTY', value=str(config.MAINTENANCE_NEEDED_PENALTY)),
        Setting(key='CLEANING_SCHEDULED_PENALTY', value=str(config.CLEANING_SCHEDULED_PENALTY)),
        Setting(key='MILEAGE_DEVIATION_PENALTY_FACTOR', value=str(config.MILEAGE_DEVIATION_PENALTY_FACTOR)),
        Setting(key='ACCESSIBILITY_SCORE_BONUS', value=str(config.ACCESSIBILITY_SCORE_BONUS)),
        Setting(key='MAINTENANCE_ACCESS_PENALTY', value=str(config.MAINTENANCE_ACCESS_PENALTY)),
        Setting(key='BRANDING_HIGH_PRIORITY_BONUS', value=str(config.BRANDING_HIGH_PRIORITY_BONUS)),
        Setting(key='BRANDING_PENALTY_BONUS', value=str(config.BRANDING_PENALTY_BONUS)),
    ]
    db_session.add_all(settings_to_insert)
    db_session.commit()
    print(f"Inserted {len(settings_to_insert)} default settings.")

def setup_database():
    print("Connecting to database...")
    engine = create_engine(config.DATABASE_URL)
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    populate_default_settings(session)
    
    session.close()
    print("Database setup check complete.")

if __name__ == '__main__':
    setup_database()
