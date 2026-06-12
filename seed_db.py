#!/usr/bin/env python
"""Seed the database with test data"""

from app import create_app, db
from app.models.robot import Robot
from app.models.user import User
from app.models.delivery import Delivery

app = create_app()

with app.app_context():
    # Clear existing data
    Robot.query.delete()
    Delivery.query.delete()
    User.query.delete()
    db.session.commit()

    from app.extensions import bcrypt
    admin_hash = bcrypt.generate_password_hash("admin123").decode("utf-8")

    admin = User(
        username="admin",
        email="admin@pup.edu.ph",
        full_name="Admin User",
        password_hash=admin_hash,
        role="admin",
        is_active=True,
        is_verified=True   
    )

    db.session.add(admin)
    db.session.commit()
    print("Admin seeded successfully!")