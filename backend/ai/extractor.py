import re
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Major Indian Cities & Districts Geocoding Dictionary
INDIAN_GEOGRAPHIC_ENTITIES = {
    'bhubaneswar': {'city': 'Bhubaneswar', 'district': 'Khordha', 'state': 'Odisha', 'lat': 20.2961, 'lng': 85.8245},
    'patia': {'city': 'Bhubaneswar', 'district': 'Khordha', 'state': 'Odisha', 'lat': 20.3588, 'lng': 85.8164, 'place_name': 'Patia'},
    'cuttack': {'city': 'Cuttack', 'district': 'Cuttack', 'state': 'Odisha', 'lat': 20.4625, 'lng': 85.8828},
    'mumbai': {'city': 'Mumbai', 'district': 'Mumbai Suburban', 'state': 'Maharashtra', 'lat': 19.0760, 'lng': 72.8777},
    'kurla': {'city': 'Mumbai', 'district': 'Mumbai Suburban', 'state': 'Maharashtra', 'lat': 19.0657, 'lng': 72.8792, 'place_name': 'Kurla'},
    'delhi': {'city': 'Delhi', 'district': 'Central Delhi', 'state': 'Delhi NCT', 'lat': 28.6139, 'lng': 77.2090},
    'bengaluru': {'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9716, 'lng': 77.5946},
    'bangalore': {'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9716, 'lng': 77.5946},
    'bellandur': {'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9304, 'lng': 77.6784, 'place_name': 'Bellandur'},
    'chennai': {'city': 'Chennai', 'district': 'Chennai', 'state': 'Tamil Nadu', 'lat': 13.0827, 'lng': 80.2707},
    'kolkata': {'city': 'Kolkata', 'district': 'Kolkata', 'state': 'West Bengal', 'lat': 22.5726, 'lng': 88.3639},
    'hyderabad': {'city': 'Hyderabad', 'district': 'Hyderabad', 'state': 'Telangana', 'lat': 17.3850, 'lng': 78.4867},
    'pune': {'city': 'Pune', 'district': 'Pune', 'state': 'Maharashtra', 'lat': 18.5204, 'lng': 73.8567},
    'jaipur': {'city': 'Jaipur', 'district': 'Jaipur', 'state': 'Rajasthan', 'lat': 26.9124, 'lng': 75.7873},
    'churu': {'city': 'Churu', 'district': 'Churu', 'state': 'Rajasthan', 'lat': 28.2900, 'lng': 74.9600},
    'shimla': {'city': 'Shimla', 'district': 'Shimla', 'state': 'Himachal Pradesh', 'lat': 31.1048, 'lng': 77.1734},
    'srinagar': {'city': 'Srinagar', 'district': 'Srinagar', 'state': 'Jammu and Kashmir', 'lat': 34.0837, 'lng': 74.7973},
    'patna': {'city': 'Patna', 'district': 'Patna', 'state': 'Bihar', 'lat': 25.5941, 'lng': 85.1376},
    'lucknow': {'city': 'Lucknow', 'district': 'Lucknow', 'state': 'Uttar Pradesh', 'lat': 26.8467, 'lng': 80.9462},
    'kochi': {'city': 'Kochi', 'district': 'Ernakulam', 'state': 'Kerala', 'lat': 9.9312, 'lng': 76.2673},
    'guwahati': {'city': 'Guwahati', 'district': 'Kamrup Metropolitan', 'state': 'Assam', 'lat': 26.1445, 'lng': 91.7362},
    'paradip': {'city': 'Paradip', 'district': 'Jagatsinghpur', 'state': 'Odisha', 'lat': 20.3164, 'lng': 86.6114},
    'dehradun': {'city': 'Dehradun', 'district': 'Dehradun', 'state': 'Uttarakhand', 'lat': 30.3165, 'lng': 78.0322},
    'chandigarh': {'city': 'Chandigarh', 'district': 'Chandigarh', 'state': 'Punjab', 'lat': 30.7333, 'lng': 76.7794},
}

INDIAN_STATES_LOOKUP = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCT', 'Jammu and Kashmir', 'Ladakh'
]

def extract_location_from_text(text: str, default_location: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extracts City, District, State, Place name, and Geocodes from weather report text.
    Preserves original location text and specifies geocoding source.
    """
    if not text:
        return default_location or {}

    lowered = text.lower()
    found_entity = None
    place_specifier = None

    # Prioritize specific places/localities first (those with place_name) then cities
    sorted_entities = sorted(
        INDIAN_GEOGRAPHIC_ENTITIES.items(),
        key=lambda x: (1 if 'place_name' in x[1] else 0, len(x[0])),
        reverse=True
    )

    for key, entity in sorted_entities:
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, lowered):
            found_entity = entity.copy()
            if 'place_name' in entity:
                place_specifier = entity['place_name']
            break

    # Look for Indian State mentions
    found_state = None
    for state in INDIAN_STATES_LOOKUP:
        pattern = r'\b' + re.escape(state.lower()) + r'\b'
        if re.search(pattern, lowered):
            found_state = state
            break

    if found_entity:
        result = {
            "city": found_entity.get('city'),
            "district": found_entity.get('district'),
            "state": found_state or found_entity.get('state'),
            "latitude": found_entity.get('lat'),
            "longitude": found_entity.get('lng'),
            "place_name": place_specifier or found_entity.get('city'),
            "geocoding_source": "National Geospatial Gazetteer (NER Rule Engine)",
            "extraction_confidence": 0.95
        }
        return result

    # Check state match only
    if found_state:
        return {
            "state": found_state,
            "place_name": found_state,
            "geocoding_source": "State Gazetteer Match",
            "extraction_confidence": 0.80
        }

    # Fallback to provided default location if available
    if default_location:
        return {
            "city": default_location.get("name"),
            "district": default_location.get("district"),
            "state": default_location.get("state"),
            "latitude": default_location.get("lat"),
            "longitude": default_location.get("lng"),
            "place_name": default_location.get("name"),
            "geocoding_source": "Report Metadata Geotag",
            "extraction_confidence": 0.85
        }

    return {
        "place_name": "Unspecified Location",
        "geocoding_source": "None",
        "extraction_confidence": 0.0
    }


def extract_time_from_text(text: str, default_time: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Extracts temporal expressions (e.g. '10:30 IST', 'today', 'past 3 hours', 'yesterday').
    """
    if not text:
        return {"extracted_time_str": default_time.isoformat() if default_time else None, "time_confidence": 0.5}

    lowered = text.lower()
    time_match = re.search(r'\b(\d{1,2}:\d{2}\s*(?:am|pm|ist)?)\b', lowered)
    
    extracted_str = None
    confidence = 0.5

    if time_match:
        extracted_str = time_match.group(1).upper()
        confidence = 0.90
    elif "today" in lowered or "morning" in lowered:
        extracted_str = "Today (Observed)"
        confidence = 0.75
    elif "yesterday" in lowered:
        extracted_str = "Yesterday"
        confidence = 0.75
    elif "hours ago" in lowered:
        extracted_str = "Recent (Past Hours)"
        confidence = 0.80
    elif default_time:
        extracted_str = default_time.strftime("%d %b %Y, %H:%M IST")
        confidence = 0.65

    return {
        "extracted_time_str": extracted_str,
        "time_confidence": confidence
    }
