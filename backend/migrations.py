import sqlite3
import os
from backend.config import settings

def run_migrations():
    db_path = os.path.join(settings.BASE_DIR, "data", "weather_intelligence.db")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(weather_reports)")
    cols = [row[1] for row in cursor.fetchall()]
    
    if "event_group_id" not in cols:
        print("Migrating: adding event_group_id column to weather_reports...")
        cursor.execute("ALTER TABLE weather_reports ADD COLUMN event_group_id VARCHAR(64)")
        conn.commit()
        print("Column event_group_id added successfully.")
    else:
        print("Migration: event_group_id already exists.")

    conn.close()

if __name__ == "__main__":
    run_migrations()
