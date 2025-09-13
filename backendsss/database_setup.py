import sqlite3
import os

DB_FILE = 'kmrl_schedule.db'

def setup_database():
    """
    Sets up the SQLite database and creates the necessary tables.
    This should be run once.
    """
    if os.path.exists(DB_FILE):
        print(f"Database '{DB_FILE}' already exists. Setup not required.")
        return

    print("Creating new database...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Table to store the final, confirmed daily schedules
    cursor.execute('''
    CREATE TABLE schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_date TEXT NOT NULL,
        train_id INTEGER NOT NULL,
        final_decision TEXT NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(schedule_date, train_id)
    )
    ''')
    print("Created 'schedules' table.")

    # Table to explicitly log manual overrides for analysis
    cursor.execute('''
    CREATE TABLE override_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date TEXT NOT NULL,
        train_id INTEGER NOT NULL,
        ai_prediction TEXT NOT NULL,
        supervisor_decision TEXT NOT NULL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("Created 'override_log' table.")

    conn.commit()
    conn.close()
    print("Database setup complete.")

if __name__ == '__main__':
    setup_database()
