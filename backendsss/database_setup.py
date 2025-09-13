import sqlite3
import os
import config

def populate_default_settings(cursor):
    """Populates the settings table with default values from the config file."""
    print("Populating default settings...")
    # Check if settings already exist
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] > 0:
        print("Settings table is not empty. Skipping population.")
        return

    settings_to_insert = [
        ('FITNESS_WEIGHTS', str(config.FITNESS_WEIGHTS)),
        ('CERTS_CRITICAL_PENALTY', str(config.CERTS_CRITICAL_PENALTY)),
        ('MAINTENANCE_NEEDED_PENALTY', str(config.MAINTENANCE_NEEDED_PENALTY)),
        ('CLEANING_SCHEDULED_PENALTY', str(config.CLEANING_SCHEDULED_PENALTY)),
        ('MILEAGE_DEVIATION_PENALTY_FACTOR', str(config.MILEAGE_DEVIATION_PENALTY_FACTOR)),
        ('ACCESSIBILITY_SCORE_BONUS', str(config.ACCESSIBILITY_SCORE_BONUS)),
        ('MAINTENANCE_ACCESS_PENALTY', str(config.MAINTENANCE_ACCESS_PENALTY)),
        ('BRANDING_HIGH_PRIORITY_BONUS', str(config.BRANDING_HIGH_PRIORITY_BONUS)),
        ('BRANDING_PENALTY_BONUS', str(config.BRANDING_PENALTY_BONUS)),
    ]
    cursor.executemany("INSERT INTO settings (key, value) VALUES (?, ?)", settings_to_insert)
    print(f"Inserted {len(settings_to_insert)} default settings.")

def setup_database():
    """
    Sets up the SQLite database and creates the necessary tables if they don't exist.
    This can be run multiple times safely.
    """
    print("Connecting to database...")
    conn = sqlite3.connect(config.DB_FILE)
    cursor = conn.cursor()

    # --- Check and create 'schedules' table ---
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='schedules'")
    if cursor.fetchone() is None:
        cursor.execute("""
        CREATE TABLE schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_date TEXT NOT NULL,
            train_id INTEGER NOT NULL,
            final_decision TEXT NOT NULL,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(schedule_date, train_id)
        )
        """)
        print("Created 'schedules' table.")
    else:
        print("'schedules' table already exists.")

    # --- Check and create 'override_log' table ---
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='override_log'")
    if cursor.fetchone() is None:
        cursor.execute("""
        CREATE TABLE override_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_date TEXT NOT NULL,
            train_id INTEGER NOT NULL,
            ai_prediction TEXT NOT NULL,
            supervisor_decision TEXT NOT NULL,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Created 'override_log' table.")
    else:
        print("'override_log' table already exists.")

    # --- Check and create 'jobs' table ---
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='jobs'")
    if cursor.fetchone() is None:
        cursor.execute("""
        CREATE TABLE jobs (
            job_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Created 'jobs' table.")
    else:
        print("'jobs' table already exists.")

    # --- Check and create 'settings' table ---
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
    if cursor.fetchone() is None:
        cursor.execute("""
        CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """)
        print("Created 'settings' table.")
        populate_default_settings(cursor)
    else:
        print("'settings' table already exists.")

    conn.commit()
    conn.close()
    print("Database setup check complete.")

if __name__ == '__main__':
    setup_database()
