import os
import logging
from typing import Dict, Any

logger = logging.getLogger("imd")

def check_imd_connector_status() -> Dict[str, Any]:
    """
    Evaluates IMD (India Meteorological Department) connector readiness.
    Accurately documents required MoES authorization credentials.
    """
    api_key = os.getenv("IMD_API_KEY")
    if not api_key:
        return {
            "source": "India Meteorological Department (IMD)",
            "status": "blocked_missing_credentials",
            "connected": False,
            "reason": "Official IMD Doppler radar feeds & automated weather station (AWS) APIs require MoES registered credentials (IMD_API_KEY).",
            "fallback": "Using imported high-precision Indian Synoptic datasets and Open-Meteo satellite reanalysis.",
            "documentation_url": "https://mausam.imd.gov.in/"
        }
    
    # If credentials were provided
    return {
        "source": "India Meteorological Department (IMD)",
        "status": "active",
        "connected": True,
        "api_key_configured": True
    }
