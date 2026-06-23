"""
Response helper utilities for consistent API responses.
"""

from flask import jsonify
from typing import Any, Dict, Tuple


def success_response(data: Any, status_code: int = 200) -> Tuple[Dict, int]:
    """
    Return a successful JSON response.
    
    Args:
        data: The response data (will be converted to JSON)
        status_code: HTTP status code (default: 200)
    
    Returns:
        Tuple of (response_dict, status_code)
    """
    if isinstance(data, dict):
        return data, status_code
    return {"data": data}, status_code


def error_response(message: str, status_code: int = 400) -> Tuple[Dict, int]:
    """
    Return an error JSON response.
    
    Args:
        message: The error message
        status_code: HTTP status code (default: 400)
    
    Returns:
        Tuple of (error_dict, status_code)
    """
    return {"error": message}, status_code
