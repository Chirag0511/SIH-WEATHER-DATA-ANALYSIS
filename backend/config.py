import os

class Settings:
    PROJECT_NAME: str = "National Weather Intelligence Platform (India) API"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_RAW_DIR: str = os.path.join(BASE_DIR, "data", "raw")
    DATA_PROCESSED_DIR: str = os.path.join(BASE_DIR, "data", "processed")
    DATA_REPORTS_DIR: str = os.path.join(BASE_DIR, "data", "reports")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'data', 'weather_intelligence.db')}"
    )
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]
    
    # Open-Meteo API URL
    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"

settings = Settings()
