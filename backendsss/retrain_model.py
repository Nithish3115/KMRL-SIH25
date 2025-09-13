import pandas as pd
from data_service import DataService
from ml_service import TrainInductionModel
import config

def run_retraining_pipeline():
    """
    Executes the full retraining pipeline:
    1. Loads the original synthetic data.
    2. Loads the human-approved data from the database.
    3. Combines and prioritizes the approved data.
    4. Retrains and saves a new model.
    """
    print("--- Starting Model Retraining Pipeline ---")

    # Initialize services
    data_service = DataService()
    
    # 1. Load original data
    original_df = data_service.load_data()
    if original_df is None:
        print("Cannot retrain without original data file. Exiting.")
        return

    # 2. Load approved data from DB
    approved_df = data_service.get_historical_approved_data()

    if approved_df.empty:
        print("No approved schedules found in the database. No new data to learn from. Exiting.")
        return

    # 3. Combine datasets
    # Merge approved decisions into the original dataset, which has all features
    # This keeps all the rich features from the original data and updates the target variable
    # with the supervisor's final decision.
    
    # Set indices for efficient merging
    original_df.set_index(['date', 'train_id'], inplace=True)
    approved_df.set_index(['date', 'train_id'], inplace=True)

    # Update the 'induction_decision' in the original dataframe with the approved one
    original_df.update(approved_df)
    
    retraining_df = original_df.reset_index()
    print(f"Combined dataset for retraining has {len(retraining_df)} records.")

    # 4. Retrain the model
    # We pass the full new dataframe to the data_service instance
    data_service.df = retraining_df
    X_train, X_test, y_train, y_test = data_service.preprocess_for_training()

    # Initialize a new model instance to train
    # Save the new model over the old one
    new_model = TrainInductionModel(data_service=data_service, model_path=config.MODEL_PATH)
    new_model.train(X_train, y_train, X_test, y_test, data_service)

    print("--- Model Retraining Pipeline Finished Successfully ---")

if __name__ == '__main__':
    run_retraining_pipeline()