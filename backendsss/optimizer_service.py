import random
from deap import base, creator, tools, algorithms
import numpy as np

from ml_service import TrainInductionModel

class GeneticOptimizer:
    """
    The definitive multi-objective optimization engine. This version uses a
    decorator to robustly enforce constraints throughout the entire evolution,
    guaranteeing the final plan meets the supervisor's requirements.
    """
    def __init__(self, ml_service: TrainInductionModel):
        self.ml_service = ml_service
        self.weights = (0.3, 0.4, 0.3) # (Readiness, Financial, Balance)

    def _evaluate_plan(self, individual, daily_data, all_contracts):
        # This "Fitness Function" is now stable and correct
        plan = [t.copy() for t in daily_data]
        decision_map = {0: 'Maintenance', 1: 'Standby', 2: 'Inducted'}
        for i, train in enumerate(plan):
            train['final_decision'] = decision_map[individual[i]]
        kpis = self.ml_service._calculate_plan_kpis(plan, all_contracts)
        return (kpis['readiness_score'] * self.weights[0] + 
                kpis['financial_score'] * self.weights[1] + 
                kpis['balance_score'] * self.weights[2]),

    def run_optimization(self, date_str: str, required_inducted: int):
        print(f"\n--- Starting Definitive Genetic Algorithm for {date_str} ---")
        daily_data = self.ml_service.get_recommendations(date_str)
        if not daily_data: return {"error": "Could not retrieve daily data."}

        num_trains = len(daily_data)
        
        creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        creator.create("Individual", list, fitness=creator.FitnessMax)

        toolbox = base.Toolbox()
        toolbox.register("attr_int", random.randint, 0, 2)
        toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_int, num_trains)
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)

        # --- DEFINITIVE CONSTRAINT ENFORCEMENT DECORATOR ---
        def ensure_constraints(func):
            def wrapper(*args, **kwargs):
                result = func(*args, **kwargs)
                # DEAP can return a single individual or a list, handle both
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
                            else: # Fallback if no standby trains exist
                                maint_indices = [i for i, val in enumerate(ind) if val == 0]
                                if maint_indices: ind[random.choice(maint_indices)] = 2
                return result
            return wrapper
        # --- END OF DECORATOR ---

        toolbox.register("evaluate", self._evaluate_plan, daily_data=daily_data, all_contracts=self.ml_service.data_service.branding_contracts)
        toolbox.register("mate", tools.cxTwoPoint)
        toolbox.register("mutate", tools.mutUniformInt, low=0, up=2, indpb=0.1)
        # Apply the decorator to the functions that change individuals
        toolbox.decorate("mate", ensure_constraints)
        toolbox.decorate("mutate", ensure_constraints)
        toolbox.register("select", tools.selTournament, tournsize=3)
        
        population = toolbox.population(n=200) # Increased population size
        # Enforce constraints on the initial random population
        population = ensure_constraints(lambda: population)()

        # Evolve for more generations to find a better solution
        algorithms.eaSimple(population, toolbox, cxpb=0.6, mutpb=0.3, ngen=50, verbose=False) 
        
        best_individual = tools.selBest(population, 1)[0]
        best_fitness_score = best_individual.fitness.values[0]
        
        final_plan = [t.copy() for t in daily_data]
        decision_map = {0: 'Maintenance', 1: 'Standby', 2: 'Inducted'}
        for i, train in enumerate(final_plan):
            train['final_decision'] = decision_map[best_individual[i]]
            
        final_kpis = self.ml_service._calculate_plan_kpis(final_plan, self.ml_service.data_service.branding_contracts)

        return {
            "best_plan_found": {
                "title": "Genetic Algorithm Optimized Plan",
                "overall_score": round(best_fitness_score, 2),
                "plan_kpis": final_kpis,
                "schedule": final_plan
            }
        }

