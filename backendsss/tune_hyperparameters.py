import pandas as pd
import xgboost as xgb
from sklearn.model_selection import GridSearchCV
from data_service import DataService
import config

def tune_hyperparameters():
    """
    Performs hyperparameter tuning for the XGBoost model using GridSearchCV.
    """
    print("--- Starting Hyperparameter Tuning ---")

    # Load data using DataService
    data_service = DataService()
    X_train, _, y_train, _ = data_service.preprocess_for_training()

    # Define the model
    model = xgb.XGBClassifier(objective='multi:softmax', num_class=3, use_label_encoder=False, eval_metric='mlogloss')

    # Set up the grid search
    grid_search = GridSearchCV(estimator=model, param_grid=config.HYPERPARAMETER_GRID, scoring='accuracy', cv=3, verbose=2)

    # Run the grid search
    grid_search.fit(X_train, y_train)

    # Print the best parameters
    print("\n--- Hyperparameter Tuning Finished ---")
    print(f"Best parameters found: {grid_search.best_params_}")
    print(f"Best accuracy found: {grid_search.best_score_}")

if __name__ == '__main__':
    tune_hyperparameters()