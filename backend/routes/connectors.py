from fastapi import APIRouter, Query, HTTPException
from backend.connectors.openmeteo import fetch_live_weather
from backend.connectors.imd import check_imd_connector_status

router = APIRouter(prefix="/connectors", tags=["Weather Data Connectors"])

@router.get("/status")
def get_connectors_status():
    imd_status = check_imd_connector_status()
    openmeteo_status = {
        "source": "Open-Meteo Public API",
        "status": "active",
        "connected": True,
        "endpoint": "https://api.open-meteo.com/v1/forecast",
        "coverage": "Global high-resolution grid (including all Indian coordinates)",
        "auth_required": False
    }
    citizen_status = {
        "source": "Citizen Ground-Truth Submissions",
        "status": "active",
        "connected": True,
        "auth_required": False
    }

    return {
        "status": "healthy",
        "connectors": [
            openmeteo_status,
            imd_status,
            citizen_status
        ]
    }

@router.get("/live-weather")
def get_live_weather(
    lat: float = Query(..., ge=6.0, le=38.0, description="Latitude in India"),
    lng: float = Query(..., ge=68.0, le=98.0, description="Longitude in India")
):
    result = fetch_live_weather(lat, lng)
    if not result:
        raise HTTPException(status_code=502, detail="Failed to fetch live weather from Open-Meteo")
    return result
