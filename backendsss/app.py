from flask import Flask, jsonify, request, g
from flask_cors import CORS
from datetime import datetime, date
import os
import uuid
import threading
import sqlite3
import json
import config
from utils import get_settings

# Import all custom services
from data_service import DataService
from ml_service import TrainInductionModel
from optimizer_service import GeneticOptimizer

# --- App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = sqlite3.connect(config.DB_FILE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """Closes the database again at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

# --- Service Initialization ---
data_service = None
ml_service = None
optimizer_service = None

def initialize_services():
    """Initializes all backend services at startup."""
    global data_service, ml_service, optimizer_service
    if not os.path.exists(config.MODEL_PATH) or not os.path.exists(config.LABEL_ENCODERS_PATH):
        print("ERROR: Model files not found. Please run 'python main.py' first.")
        exit()
    if data_service is None:
        print("Initializing all services...")
        data_service = DataService()
        ml_service = TrainInductionModel(data_service=data_service)
        optimizer_service = GeneticOptimizer(ml_service=ml_service)
        print("All services initialized successfully.")

# --- Settings Endpoints ---
@app.route('/api/settings', methods=['GET'])
def get_all_settings():
    """Fetches all settings from the database."""
    settings = get_settings()
    return jsonify(settings)

@app.route('/api/settings', methods=['POST'])
def update_settings():
    """Updates one or more settings in the database."""
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400

    db = get_db()
    for key, value in data.items():
        db.execute(
            'UPDATE settings SET value = ? WHERE key = ?',
            (str(value), key)
        )
    db.commit()
    return jsonify({"message": "Settings updated successfully."})

# --- Asynchronous Optimizer Endpoints (with DB persistence) ---

@app.route('/start-true-optimize', methods=['POST'])
def start_true_optimize_schedule():
    """
    STARTS the long-running Genetic Algorithm in a background thread,
    logs the job in the database, and immediately returns a job ID.
    """
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    
    date_str = data.get('date', date.today().strftime('%Y-%m-%d'))
    required_inducted = data.get('required_inducted')
    if not required_inducted: return jsonify({"error": "Missing 'required_inducted' constraint."}), 400
    
    job_id = str(uuid.uuid4())
    db = get_db()
    db.execute(
        'INSERT INTO jobs (job_id, status) VALUES (?, ?)',
        (job_id, 'running')
    )
    db.commit()

    # Pass the DB file path to the background thread
    thread = threading.Thread(target=optimizer_service.run_optimization_background, args=(job_id, config.DB_FILE, date_str, required_inducted))
    thread.start()
    
    return jsonify({"message": "Optimization job started.", "job_id": job_id}), 202

@app.route('/true-optimize-status/<job_id>', methods=['GET'])
def get_true_optimize_status(job_id):
    """CHECKS the status of a background optimization job from the database."""
    db = get_db()
    job_row = db.execute('SELECT status FROM jobs WHERE job_id = ?', (job_id,)).fetchone()
    
    if not job_row:
        return jsonify({"error": "Job ID not found."}), 404
        
    return jsonify({"job_id": job_id, "status": job_row['status']})

@app.route('/true-optimize-result/<job_id>', methods=['GET'])
def get_true_optimize_result(job_id):
    """GETS the final result of a completed optimization job from the database."""
    db = get_db()
    job_row = db.execute('SELECT status, result FROM jobs WHERE job_id = ?', (job_id,)).fetchone()

    if not job_row:
        return jsonify({"error": "Job ID not found."}), 404
        
    if job_row['status'] != 'completed':
        return jsonify({"error": "Job is still running or has failed."}), 202
    
    # The result is stored as a JSON string, so we need to parse it
    result = json.loads(job_row['result'])
    return jsonify(result)

# --- ALL OTHER ENDPOINTS ARE STABLE AND UNCHANGED ---
@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    date_str = request.args.get('date', default=date.today().strftime('%Y-%m-%d'))
    try:
        recommendations = ml_service.get_recommendations(date_str)
        if not recommendations: return jsonify({"error": f"No data found for date {date_str}."}), 404
        return jsonify(recommendations)
    except Exception as e: return jsonify({"error": str(e)}), 500
@app.route('/optimize', methods=['POST'])
def optimize_schedule():
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    schedule_date_str = data.get('date')
    constraints = data.get('constraints')
    if not schedule_date_str or not constraints: return jsonify({"error": "Missing 'date' or 'constraints'."}), 400
    try:
        initial_recommendations = ml_service.get_recommendations(schedule_date_str)
        if not initial_recommendations: return jsonify({"error": f"No data for date {schedule_date_str}."}), 404
        optimized_schedule = ml_service.optimize_recommendations(initial_recommendations, constraints)
        return jsonify(optimized_schedule)
    except Exception as e: return jsonify({"error": str(e)}), 500
@app.route('/what-if-on-plan', methods=['POST'])
def what_if_on_plan():
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    existing_plan = data.get('plan')
    change_details = data.get('change')
    if not existing_plan or not change_details: return jsonify({"error": "Request must include 'plan' and 'change'."}), 400
    try:
        result = ml_service.run_what_if_on_existing_plan(existing_plan, change_details)
        return jsonify(result)
    except Exception as e: return jsonify({"error": str(e)}), 500
@app.route('/shunting-plan', methods=['POST'])
def get_shunting_plan():
    final_schedule = request.get_json()
    if not final_schedule or not isinstance(final_schedule, list): return jsonify({"error": "Request body must be a JSON list."}), 400
    try:
        shunting_plan = ml_service.generate_shunting_plan(final_schedule)
        return jsonify(shunting_plan)
    except Exception as e: return jsonify({"error": str(e)}), 500
@app.route('/schedule', methods=['POST'])
def save_schedule():
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    schedule_date_str = data.get('date')
    final_schedule_list = data.get('schedule')
    if not schedule_date_str or not final_schedule_list: return jsonify({"error": "Missing 'date' or 'schedule'."}), 400
    try:
        schedule_date = datetime.strptime(schedule_date_str, '%Y-%m-%d').date()
        original_recs = ml_service.get_recommendations(schedule_date_str)
        original_predictions = {rec['train_id']: rec['predicted_decision'] for rec in original_recs}
        data_service.save_final_schedule(schedule_date, final_schedule_list, original_predictions)
        return jsonify({"message": f"Final schedule for {schedule_date_str} saved successfully."})
    except Exception as e: return jsonify({"error": str(e)}), 500

# --- Main Execution ---
if __name__ == '__main__':
    initialize_services()
    app.run(host='0.0.0.0', port=5000, debug=False)