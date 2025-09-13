import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import sqlite3
from datetime import date, datetime
import json
import config

class DataService:
    """
    Handles all data operations. This final version is upgraded to load and
    understand the depot layout for stabling geometry analysis.
    """
    def __init__(self, file_path=config.TRAIN_DATA_PATH):
        self.file_path = file_path
        self.df = self.load_data()
        self.label_encoders = {}
        self.cleaning_schedule = self._load_json_data(config.CLEANING_SCHEDULE_PATH, default={"default": {}})
        self.branding_contracts = self._load_branding_contracts()
        self.depot_layout = self._load_json_data(config.DEPOT_LAYOUT_PATH, default={}).get('depot_layout', {})

    def _load_json_data(self, filename: str, default: dict) -> dict:
        """Helper function to load any JSON file safely."""
        try:
            with open(filename, 'r') as f:
                print(f"Loading data from {filename}...")
                return json.load(f)
        except FileNotFoundError:
            print(f"WARNING: '{filename}' not found.")
            return default

    def _load_branding_contracts(self):
        """Loads branding contract data and maps it by train_id."""
        contracts_data = self._load_json_data(config.BRANDING_CONTRACTS_PATH, default={}).get("contracts", [])
        return {contract['train_id']: contract for contract in contracts_data}

    def get_track_properties(self, track_name: str) -> dict:
        """
        NEW & CRITICAL: Retrieves the properties (accessibility, status, etc.) 
        for a specific track from the loaded depot layout data.
        """
        return self.depot_layout.get(track_name, {"accessibility_score": 0, "has_maintenance_access": False, "status": "Unknown"})
    
    def _get_db_connection(self):
        return sqlite3.connect(config.DB_FILE)

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

    def load_data(self):
        try:
            df = pd.read_csv(self.file_path)
            df['date'] = pd.to_datetime(df['date'])
            return df
        except FileNotFoundError: 
            print(f"Warning: Data file not found at {self.file_path}")
            return None

    def preprocess_for_training(self):
        if self.df is None: return None, None, None, None
        df = self.df.copy()
        categorical_cols = ['job_card_status', 'branding_priority', 'cleaning_status', 'stabling_location']
        
        for col in categorical_cols:
            le = LabelEncoder()
            # Add 'unknown' to the list of classes to handle unseen values gracefully
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
                # This robust strategy handles unseen values by mapping them to the 'unknown' category
                # that the model was trained on, preventing prediction errors.
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
        conn = self._get_db_connection()
        cursor = conn.cursor()
        date_str = schedule_date.strftime('%Y-%m-%d')
        for train in final_schedule:
            train_id = train['train_id']
            final_decision = train['final_decision']
            cursor.execute('INSERT INTO schedules (schedule_date, train_id, final_decision) VALUES (?, ?, ?) ON CONFLICT(schedule_date, train_id) DO UPDATE SET final_decision=excluded.final_decision', (date_str, train_id, final_decision))
            ai_prediction = original_predictions.get(train_id)
            if ai_prediction and ai_prediction != final_decision:
                cursor.execute('INSERT INTO override_log (log_date, train_id, ai_prediction, supervisor_decision) VALUES (?, ?, ?, ?)', (date_str, train_id, ai_prediction, final_decision))
        conn.commit()
        conn.close()

    def get_historical_approved_data(self):
        conn = self._get_db_connection()
        df = pd.read_sql_query("SELECT schedule_date as date, train_id, final_decision as induction_decision FROM schedules", conn)
        conn.close()
        df['date'] = pd.to_datetime(df['date'])
        return df
