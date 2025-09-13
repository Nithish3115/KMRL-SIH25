from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, date
import os

# Import all custom services, the complete brain of the application
from data_service import DataService
from ml_service import TrainInductionModel
from optimizer_service import GeneticOptimizer 

# --- App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for any frontend

# --- Service Initialization ---
# We define them globally and initialize them once to be efficient.
data_service = None
ml_service = None
optimizer_service = None # The Genetic Algorithm service

def initialize_services():
    """
    Initializes all backend services at startup. This is the definitive version
    that loads all three intelligent services.
    """
    global data_service, ml_service, optimizer_service
    
    # Prerequisite check to ensure the system has been trained
    if not os.path.exists('model.xgb') or not os.path.exists('label_encoders.pkl'):
        print("="*50)
        print("ERROR: Model files not found. Please run 'python main.py' first.")
        print("="*50)
        exit()
        
    if data_service is None:
        print("Initializing all services...")
        data_service = DataService()
        ml_service = TrainInductionModel(data_service=data_service)
        optimizer_service = GeneticOptimizer(ml_service=ml_service) # Initialize the GA service
        print("All services initialized successfully.")

# --- API Endpoints ---

@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Endpoint to get the initial AI-ranked recommendations."""
    date_str = request.args.get('date', default=date.today().strftime('%Y-%m-%d'))
    try:
        recommendations = ml_service.get_recommendations(date_str)
        if not recommendations: return jsonify({"error": f"No data found for date {date_str}."}), 404
        return jsonify(recommendations)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/optimize', methods=['POST'])
def optimize_schedule():
    """Endpoint to apply simple, hard constraints to a plan."""
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

@app.route('/true-optimize', methods=['POST'])
def true_optimize_schedule():
    """The most powerful endpoint: Runs the Genetic Algorithm to find the single best plan."""
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    date_str = data.get('date', date.today().strftime('%Y-%m-%d'))
    required_inducted = data.get('required_inducted')
    if not required_inducted: return jsonify({"error": "Missing 'required_inducted' constraint."}), 400
    try:
        result = optimizer_service.run_optimization(date_str, required_inducted)
        return jsonify(result)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/what-if-on-plan', methods=['POST'])
def what_if_on_plan():
    """
    The definitive "What-If" Endpoint. It takes a full plan (e.g., from the
    optimizer) and analyzes the impact of a single change on that plan.
    """
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON."}), 400
    
    existing_plan = data.get('plan')
    change_details = data.get('change')

    if not existing_plan or not change_details:
        return jsonify({"error": "Request must include the 'plan' and the 'change' details."}), 400
    try:
        result = ml_service.run_what_if_on_existing_plan(existing_plan, change_details)
        return jsonify(result)
    except Exception as e: return jsonify({"error": f"An unexpected error during analysis: {str(e)}"}), 500

@app.route('/shunting-plan', methods=['POST'])
def get_shunting_plan():
    """Endpoint to generate a real-time, status-aware shunting plan."""
    final_schedule = request.get_json()
    if not final_schedule or not isinstance(final_schedule, list): return jsonify({"error": "Request body must be a JSON list of trains."}), 400
    try:
        shunting_plan = ml_service.generate_shunting_plan(final_schedule)
        return jsonify(shunting_plan)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/schedule', methods=['POST'])
def save_schedule():
    """Endpoint to save the final, supervisor-approved schedule to the database."""
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

