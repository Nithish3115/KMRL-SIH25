from database import SessionLocal
from database_setup import Setting

def get_settings():
    """Fetches all settings from the database and returns them as a dictionary."""
    db = SessionLocal()
    try:
        settings = db.query(Setting).all()
        return {setting.key: setting.value for setting in settings}
    finally:
        db.close()