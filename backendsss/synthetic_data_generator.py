import pandas as pd
import numpy as np
from datetime import date, timedelta, datetime
import random
import os

def generate_synthetic_data():
    """
    Generates a realistic, challenging synthetic dataset. This definitive version
    increases the probability of maintenance issues and certificate expirations
    across the entire fleet to ensure all features are robustly testable.
    """
    output_filename = 'train_schedule_data.csv'
    
    if os.path.exists(output_filename):
        print(f"Data file '{output_filename}' already exists. Skipping generation.")
        print("To regenerate, please delete the existing file.")
        return
        
    print(f"Generating realistic fleet data with built-in conflicts...")
    
    today = date.today()
    start_date = today - timedelta(days=180)
    end_date = today + timedelta(days=185)
    
    num_trains = 25
    train_ids = range(1, num_trains + 1)
    
    data = []
    
    # --- ENHANCED REALISM ---
    # The initial certificate days are now more varied, with a lower minimum.
    # This ensures some trains will always be approaching their expiry date.
    train_attributes = {
        train_id: {
            'mileage_km': random.randint(50000, 200000),
            'rolling_stock_cert_days_remaining': random.randint(5, 90), # Lower min
            'signalling_cert_days_remaining': random.randint(5, 180), # Lower min
            'telecom_cert_days_remaining': random.randint(5, 365), # Lower min
            'branding_priority': random.choice(['High', 'Medium', 'Low']),
            'days_since_last_clean': random.randint(0, 30)
        }
        for train_id in train_ids
    }

    current_date = start_date
    while current_date <= end_date:
        for train_id in train_ids:
            attrs = train_attributes[train_id]
            
            attrs['days_since_last_clean'] += 1
            attrs['rolling_stock_cert_days_remaining'] -= 1
            attrs['signalling_cert_days_remaining'] -= 1
            attrs['telecom_cert_days_remaining'] -= 1
            
            if attrs['rolling_stock_cert_days_remaining'] <= 0: attrs['rolling_stock_cert_days_remaining'] = 90
            if attrs['signalling_cert_days_remaining'] <= 0: attrs['signalling_cert_days_remaining'] = 180
            if attrs['telecom_cert_days_remaining'] <= 0: attrs['telecom_cert_days_remaining'] = 365
            
            # --- ENHANCED REALISM ---
            # Increased probability of open job cards from 15% to 25%
            job_card_status = 'Closed' if random.random() > 0.25 else 'Open'
            hours_run_today = 0.0

            cleaning_is_due = attrs['days_since_last_clean'] > 30
            cleaning_status = 'Scheduled' if cleaning_is_due and random.random() > 0.3 else 'Clean'

            all_certs_valid = (
                attrs['rolling_stock_cert_days_remaining'] > 0 and
                attrs['signalling_cert_days_remaining'] > 0 and
                attrs['telecom_cert_days_remaining'] > 0
            )

            if not all_certs_valid or job_card_status == 'Open':
                induction_decision = 'Maintenance'
            elif cleaning_status == 'Scheduled':
                induction_decision = 'Standby'
                attrs['days_since_last_clean'] = 0 
            else:
                induction_decision = 'Inducted' if random.random() > 0.5 else 'Standby'

            if induction_decision == 'Inducted':
                attrs['mileage_km'] += random.randint(300, 600)
                hours_run_today = round(random.uniform(8.0, 14.0), 1)
            elif induction_decision == 'Standby':
                 attrs['mileage_km'] += random.randint(0, 50)
                 hours_run_today = round(random.uniform(0.5, 1.5), 1)
            
            row = {
                'date': current_date.strftime('%Y-%m-%d'), 'train_id': train_id,
                'mileage_km': attrs['mileage_km'],
                'rolling_stock_cert_days_remaining': attrs['rolling_stock_cert_days_remaining'],
                'signalling_cert_days_remaining': attrs['signalling_cert_days_remaining'],
                'telecom_cert_days_remaining': attrs['telecom_cert_days_remaining'],
                'job_card_status': job_card_status,
                'branding_priority': attrs['branding_priority'],
                'cleaning_status': cleaning_status, 'cleaning_due': cleaning_is_due,
                'hours_run_today': hours_run_today,
                'stabling_location': f"Track {random.randint(1, 15)}",
                'induction_decision': induction_decision
            }
            
            row['total_cert_days'] = row['rolling_stock_cert_days_remaining'] + row['signalling_cert_days_remaining'] + row['telecom_cert_days_remaining']
            row['certs_critical'] = int(any(c <= 7 for c in [row['rolling_stock_cert_days_remaining'], row['signalling_cert_days_remaining'], row['telecom_cert_days_remaining']]))
            row['maintenance_needed'] = int(row['job_card_status'] == 'Open' or not all_certs_valid)
            row['weekday'] = current_date.weekday()

            data.append(row)
        current_date += timedelta(days=1)
        
    df = pd.DataFrame(data)
    df.to_csv(output_filename, index=False)
    print("Realistic fleet data generation complete.")

if __name__ == '__main__':
    generate_synthetic_data()

    

