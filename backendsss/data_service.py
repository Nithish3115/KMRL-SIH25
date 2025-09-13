
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
from datetime import date, datetime
import json
import config
from database import SessionLocal
from database_setup import Schedule, OverrideLog, TrainData, BrandingContract, CleaningSchedule, DepotTrack
from sqlalchemy.dialects.postgresql import insert

class DataService:
    """
    Handles all data operations, now fully integrated with the PostgreSQL database.
    """
    def __init__(self):
        self.df = self.load_data_from_db()
        self.label_encoders = {}
        self.cleaning_schedule = self._load_cleaning_schedule_from_db()
        self.branding_contracts = self._load_branding_contracts_from_db()
        self.depot_layout = self._load_depot_layout_from_db()

    def _load_cleaning_schedule_from_db(self):
        db = SessionLocal()
        try:
            schedules = db.query(CleaningSchedule).all()
            return {s.date: {'available_slots': s.available_slots, 'manpower_teams': s.manpower_teams} for s in schedules}
        finally:
            db.close()

    def _load_branding_contracts_from_db(self):
        db = SessionLocal()
        try:
            contracts = db.query(BrandingContract).all()
            return {c.train_id: {'brand_name': c.brand_name, 'monthly_quota_hours': c.monthly_quota_hours, 'penalty_per_hour_inr': c.penalty_per_hour_inr} for c in contracts}
        finally:
            db.close()

    def _load_depot_layout_from_db(self):
        db = SessionLocal()
        try:
            tracks = db.query(DepotTrack).all()
            return {t.track_name: {'position': t.position, 'accessibility_score': t.accessibility_score, 'has_maintenance_access': t.has_maintenance_access, 'description': t.description, 'status': t.status} for t in tracks}
        finally:
            db.close()

    def get_track_properties(self, track_name: str) -> dict:
        return self.depot_layout.get(track_name, {"accessibility_score": 0, "has_maintenance_access": False, "status": "Unknown"})

    def get_cleaning_resources_for_date(self, date_str: str) -> dict:
        return self.cleaning_schedule.get(date_str, self.cleaning_schedule.get("default", {}))

    def get_contract_for_train(self, train_id: int) -> dict:
        return self.branding_contracts.get(train_id)

    def get_mtd_hours_for_train(self, train_id: int, target_date: date) -> float:
        if self.df is None: return 0.0
        start_of_month = target_date.replace(day=1)
        mask = ((self.df['train_id'] == train_id) & (self.df['date'] >= pd.to_datetime(start_of_month)) & (self.df['date'] < pd.to_datetime(target_date)))
        return self.df.loc[mask, 'hours_run_today'].sum()

    def get_average_daily_run_hours(self, train_id: int) -> float:
        if self.df is None: return 10.0
        mask = ((self.df['train_id'] == train_id) & (self.df['induction_decision'] == 'Inducted') & (self.df['hours_run_today'] > 0))
        inducted_days = self.df.loc[mask]
        return inducted_days['hours_run_today'].mean() if not inducted_days.empty else 10.0

    def get_fleet_average_mileage(self, daily_data: pd.DataFrame) -> float:
        return daily_data['mileage_km'].mean() if not daily_data.empty else 0

    def load_data_from_db(self):
        db = SessionLocal()
        try:
            query = db.query(TrainData).statement
            df = pd.read_sql(query, db.bind)
            return df
        except Exception as e:
            print(f"Could not load train data from database: {e}")
            return None
        finally:
            db.close()

    def preprocess_for_training(self):
        if self.df is None: return None, None, None, None
        df = self.df.copy()
        categorical_cols = ['job_card_status', 'branding_priority', 'cleaning_status', 'stabling_location']
        
        for col in categorical_cols:
            le = LabelEncoder()
            all_classes = np.append(df[col].astype(str).unique(), 'unknown')
            le.fit(all_classes)
            df[col] = le.transform(df[col].astype(str))
            self.label_encoders[col] = le

        target_col = 'induction_decision'
        le = LabelEncoder()
        df[target_col] = le.fit_transform(df[target_col])
        self.label_encoders[target_col] = le
        
        joblib.dump(self.label_encoders, config.LABEL_ENCODERS_PATH)
        
        features = ['mileage_km', 'rolling_stock_cert_days_remaining', 'signalling_cert_days_remaining', 'telecom_cert_days_remaining', 'job_card_status', 'branding_priority', 'cleaning_status', 'stabling_location', 'total_cert_days', 'certs_critical', 'weekday']
        X = df[features]
        y = df[target_col]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        return X_train, X_test, y_train, y_test

    def preprocess_for_prediction(self, daily_data):
        df = daily_data.copy()
        if not self.label_encoders: self.label_encoders = joblib.load(config.LABEL_ENCODERS_PATH)
        categorical_cols = ['job_card_status', 'branding_priority', 'cleaning_status', 'stabling_location']
        for col in categorical_cols:
            le = self.label_encoders.get(col)
            if le:
                df[col] = df[col].astype(str).apply(lambda s: s if s in le.classes_ else 'unknown')
                df[col] = le.transform(df[col])
        features = ['mileage_km', 'rolling_stock_cert_days_remaining', 'signalling_cert_days_remaining', 'telecom_cert_days_remaining', 'job_card_status', 'branding_priority', 'cleaning_status', 'stabling_location', 'total_cert_days', 'certs_critical', 'weekday']
        return df[features]

    def get_data_for_date(self, target_date):
        if self.df is None: return None
        target_date_obj = pd.to_datetime(target_date).date()
        daily_data = self.df[self.df['date'].dt.date == target_date_obj]
        return daily_data.reset_index(drop=True) if not daily_data.empty else None

    def save_final_schedule(self, schedule_date: date, final_schedule: list, original_predictions: dict):
        db = SessionLocal()
        try:
            date_str = schedule_date.strftime('%Y-%m-%d')
            for train in final_schedule:
                train_id = train['train_id']
                final_decision = train['final_decision']
                
                stmt = insert(Schedule).values(schedule_date=date_str, train_id=train_id, final_decision=final_decision)
                stmt = stmt.on_conflict_do_update(
                    index_elements=['schedule_date', 'train_id'],
                    set_=dict(final_decision=stmt.excluded.final_decision)
                )
                db.execute(stmt)

                ai_prediction = original_predictions.get(train_id)
                if ai_prediction and ai_prediction != final_decision:
                    override = OverrideLog(log_date=date_str, train_id=train_id, ai_prediction=ai_prediction, supervisor_decision=final_decision)
                    db.add(override)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    def get_historical_approved_data(self):
        db = SessionLocal()
        try:
            query = db.query(Schedule.schedule_date.label('date'), Schedule.train_id, Schedule.final_decision.label('induction_decision')).statement
            df = pd.read_sql(query, db.bind)
            df['date'] = pd.to_datetime(df['date'])
            return df
        finally:
            db.close()
