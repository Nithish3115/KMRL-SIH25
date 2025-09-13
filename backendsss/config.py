# --- Configuration File ---

# --- Database Configuration ---
DATABASE_URL = 'postgresql://postgres.dslunxuwpcxeohxiccqk:laAWqTQv3nRzhnMy@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'

# --- Model and Data Paths ---
MODEL_PATH = 'model.xgb'
LABEL_ENCODERS_PATH = 'label_encoders.pkl'
TRAIN_DATA_PATH = 'train_schedule_data.csv'
CLEANING_SCHEDULE_PATH = 'cleaning_schedule.json'
BRANDING_CONTRACTS_PATH = 'branding_contracts.json'
DEPOT_LAYOUT_PATH = 'depot_layout.json'

# --- Genetic Algorithm Parameters ---
POPULATION_SIZE = 100
CROSSOVER_PROB = 0.6
MUTATION_PROB = 0.3
N_GENERATIONS = 25

# --- Optimizer Fitness Function Weights ---
# (Readiness, Financial, Balance)
FITNESS_WEIGHTS = (0.3, 0.4, 0.3)

# --- Recommendation Scoring Weights ---
CERTS_CRITICAL_PENALTY = 30
MAINTENANCE_NEEDED_PENALTY = 50
CLEANING_SCHEDULED_PENALTY = 40
MILEAGE_DEVIATION_PENALTY_FACTOR = 2000
ACCESSIBILITY_SCORE_BONUS = 1
MAINTENANCE_ACCESS_PENALTY = 25
BRANDING_HIGH_PRIORITY_BONUS = 15
BRANDING_PENALTY_BONUS = 75

# --- Hyperparameter Tuning ---
HYPERPARAMETER_GRID = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.05, 0.1, 0.2],
    'max_depth': [3, 5, 7],
}

# --- Synthetic Data Generation Parameters ---
NUM_TRAINS = 25
START_DATE_OFFSET_DAYS = 1460
END_DATE_OFFSET_DAYS = 365
JOB_CARD_OPEN_PROB = 0.25
CLEANING_SCHEDULED_PROB = 0.3
INDUCTED_PROB = 0.5
