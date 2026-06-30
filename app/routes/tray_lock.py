# File: app/routes/tray_lock.py
from flask import Blueprint, jsonify
import requests

# Create a Blueprint for the delivery hardware
delivery_bp = Blueprint('delivery', __name__)

# The IP address of your ESP32 on the network
ESP32_IP = "http://192.168.75.218"

@delivery_bp.route('/unlock', methods=['GET'])
def unlock_tray():
    try:
        # Secretly visit the ESP32's /L URL to trigger the relay
        response = requests.get(f"{ESP32_IP}/L", timeout=3, headers={"Connection": "close"})
        
        if response.status_code == 200:
            return jsonify({"status": "success", "message": "Compartment unlocked!"}), 200
        else:
            return jsonify({"status": "error", "message": "Hardware rejected command"}), 500
            
    except requests.exceptions.RequestException:
        # Triggers if the robot is off or disconnected from Wi-Fi
        return jsonify({"status": "error", "message": "Could not reach TARS hardware"}), 503