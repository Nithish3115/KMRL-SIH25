import random
import json
import sqlite3
import time
from deap import base, creator, tools, algorithms
import numpy as np
import pandas as pd
import config
from utils import get_settings

# This service needs access to the ML service to calculate the quality of a plan
from ml_service import TrainInductionModel

class GeneticOptimizer:
    """
    The definitive multi-objective optimization engine. This version is designed
    to run in a background thread and update a central job dictionary, preventing
    server timeouts and providing a professional user experience.
    """
    def __init__(self, ml_service: TrainInductionModel):
        self.ml_service = ml_service
        # The weights for our three core objectives
        settings = get_settings()
        self.weights = eval(settings.get('FITNESS_WEIGHTS', str(config.FITNESS_WEIGHTS)))

    def _evaluate_plan(self, individual, daily_data, all_contracts):
        """
        This is the crucial "Fitness Function". It takes a plan (an "individual")
        and returns a single score representing its overall quality.
        """
        plan = [t.copy() for t in daily_data]
        decision_map = {0: 'Maintenance', 1: 'Standby', 2: 'Inducted'}
        for i, train in enumerate(plan):
            train['final_decision'] = decision_map[individual[i]]
            
        kpis = self.ml_service.calculate_plan_kpis(plan, all_contracts)
        
        return (kpis['readiness_score'] * self.weights[0] + 
                kpis['financial_score'] * self.weights[1] + 
                kpis['balance_score'] * self.weights[2]),

    def run_optimization_background(self, job_id: str, db_file: str, date_str: str, required_inducted: int):
        """
        The main function that runs the GA. It's designed to be called by a
        background thread and to update the job status in the database upon completion.
        """
        print(f"\n--- [Job ID: {job_id}] Starting background GA for {date_str} ---")
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        try:
            daily_data = self.ml_service.get_recommendations(date_str)
            if not daily_data:
                raise ValueError("Could not retrieve daily data for optimization.")

            num_trains = len(daily_data)
            
            if not hasattr(creator, "FitnessMax"):
                creator.create("FitnessMax", base.Fitness, weights=(1.0,))
            if not hasattr(creator, "Individual"):
                creator.create("Individual", list, fitness=creator.FitnessMax)

            toolbox = base.Toolbox()
            toolbox.register("attr_int", random.randint, 0, 2)
            toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_int, num_trains)
            toolbox.register("population", tools.initRepeat, list, toolbox.individual)

            def ensure_constraints(func):
                """A decorator to ensure that the number of inducted trains meets the requirement."""
                def wrapper(*args, **kwargs):
                    result = func(*args, **kwargs)
                    individuals = result if isinstance(result, list) else [result]
                    for ind in individuals:
                        while ind.count(2) != required_inducted:
                            if ind.count(2) > required_inducted:
                                indices = [i for i, val in enumerate(ind) if val == 2]
                                if indices: ind[random.choice(indices)] = 1
                            else:
                                standby_indices = [i for i, val in enumerate(ind) if val == 1]
                                if standby_indices:
                                    ind[random.choice(standby_indices)] = 2
                                else:
                                    maint_indices = [i for i, val in enumerate(ind) if val == 0]
                                    if maint_indices: ind[random.choice(maint_indices)] = 2
                    return result
                return wrapper

            toolbox.register("evaluate", self._evaluate_plan, daily_data=daily_data, all_contracts=self.ml_service.data_service.branding_contracts)
            toolbox.register("mate", tools.cxTwoPoint)
            toolbox.register("mutate", tools.mutUniformInt, low=0, up=2, indpb=0.1)
            toolbox.decorate("mate", ensure_constraints)
            toolbox.decorate("mutate", ensure_constraints)
            toolbox.register("select", tools.selTournament, tournsize=3)
            
            population = toolbox.population(n=config.POPULATION_SIZE)
            population = ensure_constraints(lambda: population)()
            
            algorithms.eaSimple(population, toolbox, cxpb=config.CROSSOVER_PROB, mutpb=config.MUTATION_PROB, ngen=config.N_GENERATIONS, verbose=False)
            
            best_individual = tools.selBest(population, 1)[0]
            best_fitness_score = best_individual.fitness.values[0]
            
            final_plan = [t.copy() for t in daily_data]
            decision_map = {0: 'Maintenance', 1: 'Standby', 2: 'Inducted'}
            for i, train in enumerate(final_plan):
                train['final_decision'] = decision_map[best_individual[i]]
                # Convert Timestamp objects to strings
                if 'date' in train and isinstance(train['date'], pd.Timestamp):
                    train['date'] = train['date'].strftime('%Y-%m-%d')

            final_kpis = self.ml_service.calculate_plan_kpis(final_plan, self.ml_service.data_service.branding_contracts)

            result = {
                "best_plan_found": {
                    "title": "Genetic Algorithm Optimized Plan (Fast)",
                    "overall_score": round(best_fitness_score, 2),
                    "plan_kpis": final_kpis,
                    "schedule": final_plan
                }
            }
            
            # Store result as a JSON string
            result_str = json.dumps(result)
            cursor.execute("UPDATE jobs SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?", ('completed', result_str, job_id))
            conn.commit()
            print(f"--- [Job ID: {job_id}] Background GA finished successfully. ---")

        except Exception as e:
            print(f"--- [Job ID: {job_id}] Background GA failed: {e}")
            error_result = json.dumps({"error": str(e)})
            cursor.execute("UPDATE jobs SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?", ('failed', error_result, job_id))
            conn.commit()
        finally:
            conn.close()