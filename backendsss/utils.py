import sqlite3
import config

def get_settings():
    """Fetches all settings from the database and returns them as a dictionary."""
    conn = sqlite3.connect(config.DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    settings = {row[0]: row[1] for row in cursor.fetchall()}
    conn.close()
    return settings
