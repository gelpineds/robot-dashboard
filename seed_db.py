#!/usr/bin/env python
"""Seed the database with test data"""

from app import create_app, db
from app.models.robot import Robot
from app.models.user import User
from app.models.delivery import Delivery
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Clear existing data
    Robot.query.delete()
    Delivery.query.delete()
    User.query.delete()
    db.session.commit()

    # Create test users
    from app.extensions import bcrypt
    admin_hash = bcrypt.generate_password_hash("admin").decode("utf-8")
    
    admin = User(
        username="admin",
        email="admin@pup.edu.ph",
        full_name="Admin User",
        password_hash=admin_hash,
        role="admin",
        is_active=True,
    )
    user1 = User(
        username="jdelacruz",
        email="jdelacruz@pup.edu.ph",
        full_name="Juan Dela Cruz",
        password_hash=admin_hash,
        role="user",
        room="CCIS",
        is_active=True,
    )
    user2 = User(
        username="msantos",
        email="msantos@pup.edu.ph",
        full_name="Maria Santos",
        password_hash=admin_hash,
        role="user",
        room="Main Building",
        is_active=True,
    )

    db.session.add_all([admin, user1, user2])
    db.session.commit()
    print("✅ Created test users")

    # Create test robots
    robots_data = [
        {"name": "PUP-BOT Unit 1", "status": "online", "location": "Main Building", "battery_level": 95},
        {"name": "PUP-BOT Unit 2", "status": "online", "location": "CCIS Building", "battery_level": 75},
        {"name": "PUP-BOT Unit 3", "status": "charging", "location": "Nantes Building", "battery_level": 30},
        {"name": "PUP-BOT Unit 5", "status": "online", "location": "Research Office", "battery_level": 88},
        {"name": "PUP-BOT Unit 6", "status": "offline", "location": "Library", "battery_level": 5},
    ]

    robots = []
    for data in robots_data:
        robot = Robot(
            name=data["name"],
            status=data["status"],
            location=data["location"],
            battery_level=data["battery_level"],
            temperature=25 + (data["battery_level"] % 10),
            is_charging=data["status"] == "charging",
        )
        robots.append(robot)

    db.session.add_all(robots)
    db.session.commit()
    print(f"✅ Created {len(robots)} test robots")

    print("\n✅ Database seeding completed successfully!")
