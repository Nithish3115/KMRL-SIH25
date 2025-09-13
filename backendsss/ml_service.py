import pandas as pd
import xgboost as xgb
import joblib
from datetime import datetime
from sklearn.metrics import classification_report
import calendar
import math

class TrainInductionModel:
    """
    The definitive version of the ML Service. It contains all features, including
    the final, corrected "What-If" engine that performs a true simulation on any
    provided plan and generates a high-level comparison summary.
    """
    def __init__(self, data_service, model_path='model.xgb'):
        self.data_service = data_service
        self.model_path = model_path
        self.model = self._load_model()
        self.label_encoders = joblib.load('label_encoders.pkl')

    def _load_model(self):
        """Loads the trained XGBoost model from the specified file path."""
        try:
            model = xgb.XGBClassifier()
            model.load_model(self.model_path)
            print("XGBoost model loaded successfully.")
            return model
        except Exception as e:
            print(f"No existing model found at {self.model_path}. A new one will be created upon training.")
            return None

    def train(self, X_train, y_train, X_test, y_test, data_service):
        """Trains the XGBoost model and saves it to a file."""
        print("Training XGBoost model...")
        self.model = xgb.XGBClassifier(
            objective='multi:softmax', num_class=3, use_label_encoder=False, 
            eval_metric='mlogloss', n_estimators=100, learning_rate=0.1, max_depth=5
        )
        self.model.fit(X_train, y_train)
        self.model.save_model(self.model_path)
        print(f"Model trained and saved to '{self.model_path}'")
        y_pred = self.model.predict(X_test)
        print("\n--- Model Evaluation on Test Set ---")
        target_names = data_service.label_encoders['induction_decision'].classes_
        print(classification_report(y_test, y_pred, target_names=target_names))
        print("-" * 34)
    
    def get_recommendations(self, date_str):
        """
        Generates the full, ranked list of recommendations, incorporating all
        scoring logic including mileage balancing and stabling geometry.
        """
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        daily_data = self.data_service.get_data_for_date(date_str)
        if daily_data is None: return []
            
        avg_mileage = self.data_service.get_fleet_average_mileage(daily_data)
        X_predict = self.data_service.preprocess_for_prediction(daily_data)
        probabilities = self.model.predict_proba(X_predict)
        decision_encoder = self.label_encoders['induction_decision']
        
        recommendations = []
        for index, row in daily_data.iterrows():
            train_id = int(row['train_id'])
            predicted_decision = decision_encoder.inverse_transform([probabilities[index].argmax()])[0]

            score = 100.0
            if row['certs_critical']: score -= 30
            if row['maintenance_needed']: score -= 50
            if row['cleaning_status'] == 'Scheduled': score -= 40
            
            mileage_deviation = row['mileage_km'] - avg_mileage
            if mileage_deviation > 20000:
                score -= (mileage_deviation / 2000)
            
            track_name = row['stabling_location']
            track_props = self.data_service.get_track_properties(track_name)
            if not row['maintenance_needed'] and track_props['accessibility_score'] > 7:
                score += track_props['accessibility_score']
            if row['maintenance_needed'] and not track_props['has_maintenance_access']:
                score -= 25
            
            alert_message, branding_details, branding_bonus = self._get_branding_and_alert_info(row, target_date, train_id)
            score += branding_bonus
            
            rec = row.to_dict()
            rec.update({
                'predicted_decision': predicted_decision, 'recommendation_score': float(score),
                'alerts': alert_message, 'branding_details': branding_details,
                'train_id': int(train_id), 'mileage_km': int(rec['mileage_km']),
                'date': rec['date'].strftime('%Y-%m-%d')
            })
            recommendations.append(rec)
            
        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return recommendations

    def _get_branding_and_alert_info(self, row, target_date, train_id):
        """Helper function to calculate branding details and score bonuses."""
        alert_message = "No alerts."
        branding_details = {"has_contract": False}
        branding_bonus = 0
        contract = self.data_service.get_contract_for_train(train_id)
        if contract:
            if row['branding_priority'] == 'High': branding_bonus += 15
            mtd_hours = self.data_service.get_mtd_hours_for_train(train_id, target_date)
            quota = contract['monthly_quota_hours']
            progress_percent = (mtd_hours / quota) * 100 if quota > 0 else 100
            days_in_month = calendar.monthrange(target_date.year, target_date.month)[1]
            current_day = target_date.day
            projected_hours = (mtd_hours / (current_day - 1)) * days_in_month if current_day > 1 else mtd_hours * days_in_month
            projected_shortfall = max(0, quota - projected_hours)
            projected_penalty = projected_shortfall * contract['penalty_per_hour_inr']
            branding_details = {"has_contract": True, "brand_name": contract['brand_name'], "monthly_quota_hours": quota, "mtd_hours_run": round(mtd_hours, 2), "quota_progress_percent": round(progress_percent, 2), "projected_penalty_inr": int(projected_penalty)}
            if projected_penalty > 1000:
                penalty_str = f"₹{int(projected_penalty):,}"
                alert_message = f"ALERT: Branding quota at risk! Projected penalty: {penalty_str}. Prioritize for induction."
                branding_bonus += 75
        return alert_message, branding_details, branding_bonus

    def _calculate_plan_kpis(self, schedule: list, all_contracts: dict) -> dict:
        """Definitive KPI engine for calculating high-level plan scores."""
        total_trains = len(schedule)
        if total_trains == 0: return {'readiness_score': 0, 'financial_score': 100, 'balance_score': 0}

        ready_count = sum(1 for t in schedule if t.get('final_decision') != 'Maintenance')
        readiness_score = (ready_count / total_trains) * 100

        total_projected_penalty = 0
        max_possible_penalty = 1
        for train in schedule:
            contract = all_contracts.get(train['train_id'])
            if contract:
                max_possible_penalty += contract.get('monthly_quota_hours', 0) * contract.get('penalty_per_hour_inr', 0)
                if train.get('final_decision') != 'Inducted':
                    total_projected_penalty += train['branding_details'].get('projected_penalty_inr', 0)
        financial_score = (1 - (total_projected_penalty / max_possible_penalty)) * 100 if max_possible_penalty > 1 else 100
        
        inducted_trains = [t['mileage_km'] for t in schedule if t.get('final_decision') == 'Inducted']
        if len(inducted_trains) > 1:
            mileage_std_dev = pd.Series(inducted_trains).std()
            avg_mileage = pd.Series(inducted_trains).mean()
            balance_score = (1 - (mileage_std_dev / avg_mileage)) * 100 if avg_mileage > 0 else 0
        else:
            balance_score = 100

        return {'readiness_score': round(readiness_score, 1), 'financial_score': round(financial_score, 1), 'balance_score': round(balance_score, 1)}

    def optimize_recommendations(self, recommendations: list, constraints: dict):
        """Applies simple, hard constraints to a plan."""
        required_inducted = constraints.get('required_inducted', 0)
        required_maintenance = constraints.get('required_maintenance', 0)
        for i in range(min(required_inducted, len(recommendations))):
            recommendations[i]['final_decision'] = 'Inducted'
        for i in range(min(required_maintenance, len(recommendations))):
            recommendations[-(i+1)]['final_decision'] = 'Maintenance'
        for rec in recommendations:
            if 'final_decision' not in rec:
                rec['final_decision'] = rec['predicted_decision']
        return recommendations

    def generate_shunting_plan(self, final_schedule: list) -> dict:
        """The definitive, status-aware Shunting Planner engine."""
        moves, warnings = [], []
        maintenance_tracks = {t: p for t, p in self.data_service.depot_layout.items() if p['has_maintenance_access'] and p.get('status', 'Available') == 'Available'}
        occupied_tracks = {train['stabling_location'] for train in final_schedule}
        for train in final_schedule:
            decision = train.get('final_decision', train.get('predicted_decision'))
            track_props = self.data_service.get_track_properties(train['stabling_location'])
            if decision == 'Maintenance' and not track_props['has_maintenance_access']:
                available_track = next((t for t in maintenance_tracks if t not in occupied_tracks), None)
                if available_track:
                    moves.append(f"Move Train {train['train_id']} from {train['stabling_location']} to {available_track} for IBL access.")
                    occupied_tracks.add(available_track)
                else:
                    warnings.append(f"CRITICAL: Train {train['train_id']} requires maintenance but ALL available IBL tracks are occupied or unavailable.")
        plan_summary = f"Generated {len(moves)} shunting move(s) with {len(warnings)} warning(s)." if moves or warnings else "Depot layout is already optimized. No shunting required."
        return {"plan_summary": plan_summary, "required_moves": moves, "warnings": warnings}

    def run_what_if_on_existing_plan(self, existing_plan: list, change: dict):
        """
        The definitive "What-If" engine. Analyzes any provided plan and
        returns a clear comparison summary.
        """
        train_id_to_change = change.get('train_id')
        action = change.get('action')
        action_word = action.split('_')[-1].title()

        original_plan = [t.copy() for t in existing_plan]
        target_train_state = next((t for t in original_plan if t['train_id'] == train_id_to_change), None)
        if not target_train_state: return {"error": "Train not found in the provided plan."}

        if target_train_state.get('final_decision') == action_word:
            return {"scenario_analysis": {"title": f"No Change Analysis for Train {train_id_to_change}", "message": f"The provided plan already has '{action_word}' as the decision for this train. Your action does not change the plan."}}
        
        updated_plan = [t.copy() for t in original_plan]
        for train in updated_plan:
            if train['train_id'] == train_id_to_change:
                train['final_decision'] = action_word
        
        original_scores = self._calculate_plan_kpis(original_plan, self.data_service.branding_contracts)
        updated_scores = self._calculate_plan_kpis(updated_plan, self.data_service.branding_contracts)
        
        summary = {}
        for key in original_scores:
            delta = updated_scores[key] - original_scores[key]
            if delta > 0.1: summary[key] = f"Increased by {delta:.1f} points (Improved)"
            elif delta < -0.1: summary[key] = f"Decreased by {abs(delta):.1f} points (Worsened)"
            else: summary[key] = "No significant change"

        return {
            "scenario_analysis": {
                "title": f"Plan Comparison for changing Train {train_id_to_change} to '{action_word}'",
                "overall_plan_scores": {
                    "original_plan": original_scores,
                    "your_hypotahiddentical_plan": updated_scores
                },
                "comparison_summary": summary
            }
        }

