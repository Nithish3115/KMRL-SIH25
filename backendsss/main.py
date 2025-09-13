from data_service import DataService
from ml_service import TrainInductionModel
import os
import config

def initial_setup():
    """
    Orchestrates the entire initial setup pipeline:
    1. Checks for the existence of the raw data file.
    2. Preprocesses the data for training.
    3. Trains the machine learning model.
    4. Saves the trained model and encoders to disk.
    """
    print("--- Starting Initial System Setup ---")
    
    # Prerequisite check: Ensure the synthetic data has been generated first.
    if not os.path.exists(config.TRAIN_DATA_PATH):
        print(f"\nERROR: Data file '{config.TRAIN_DATA_PATH}' not found.")
        print("Please run 'python synthetic_data_generator.py' first to generate it.")
        return
        
    # Step 1: Initialize the data service and prepare data for training.
    # This will also create and save the 'label_encoders.pkl' file.
    data_service = DataService()
    X_train, X_test, y_train, y_test = data_service.preprocess_for_training()
    
    # Step 2: Initialize the machine learning service.
    ml_model = TrainInductionModel(data_service=data_service)
    
    # Step 3: Train the model using the prepared data.
    # This will create and save the 'model.xgb' file.
    ml_model.train(X_train, y_train, X_test, y_test, data_service)
    
    print("\n--- Initial System Setup Finished Successfully ---")
    print(f"All necessary files ({config.MODEL_PATH}, {config.LABEL_ENCODERS_PATH}) have been created.")
    print("You can now start the API server by running 'python app.py'")

if __name__ == '__main__':
    initial_setup()