
import pandas as pd
import json
from database import SessionLocal, engine
from database_setup import TrainData, BrandingContract, CleaningSchedule, DepotTrack, Base
import config

def migrate_data():
    """Migrates data from CSV and JSON files to the PostgreSQL database."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Migrate train_schedule_data.csv
        print("Migrating train_schedule_data.csv...")
        df = pd.read_csv(config.TRAIN_DATA_PATH)
        df.rename(columns={'date': 'date_str'}, inplace=True)
        df['date'] = pd.to_datetime(df['date_str'])
        df.drop(columns=['date_str'], inplace=True)
        df.to_sql('train_data', con=engine, if_exists='replace', index=False)
        print("Done.")

        # Migrate branding_contracts.json
        print("Migrating branding_contracts.json...")
        with open(config.BRANDING_CONTRACTS_PATH, 'r') as f:
            contracts = json.load(f)['contracts']
            for contract in contracts:
                db.merge(BrandingContract(**contract))
        db.commit()
        print("Done.")

        # Migrate cleaning_schedule.json
        print("Migrating cleaning_schedule.json...")
        with open(config.CLEANING_SCHEDULE_PATH, 'r') as f:
            schedule = json.load(f)
            for date, data in schedule.items():
                db.merge(CleaningSchedule(date=date, **data))
        db.commit()
        print("Done.")

        # Migrate depot_layout.json
        print("Migrating depot_layout.json...")
        with open(config.DEPOT_LAYOUT_PATH, 'r') as f:
            layout = json.load(f)['depot_layout']
            for track_name, data in layout.items():
                db.merge(DepotTrack(track_name=track_name, **data))
        db.commit()
        print("Done.")

    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    migrate_data()
