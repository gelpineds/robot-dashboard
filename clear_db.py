#!/usr/bin/env python
"""Clear all test data from the database"""

from app import create_app, db
from app.models.robot import Robot
from app.models.user import User
from app.models.delivery import Delivery
from app.models.telemetry import Telemetry
from app.models.alert import Alert

app = create_app()

with app.app_context():
    print("🗑️  Clearing all data from the database...")
    
    # Delete all data in order of dependencies
    Alert.query.delete()
    Telemetry.query.delete()
    Delivery.query.delete()
    Robot.query.delete()
    User.query.delete()
    
    db.session.commit()
    print("✅ All data cleared successfully!")
    print("\nDatabase is now empty. You can:")
    print("1. Register a new user at /login (click 'Sign up')")
    print("2. Create robots via API or manually add them")
    print("3. Test the delivery workflow with real data")
