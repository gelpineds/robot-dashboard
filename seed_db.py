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

    # Create test deliveries
    now = datetime.utcnow()
    deliveries_data = [
        {
            "document_name": "Midterm Exam Papers",
            "sender": "Dr. Johnson",
            "recipient": "Juan Dela Cruz",
            "pickup_location": "CCIS Building",
            "dropoff_location": "Main Building",
            "status": "delivered",
            "requested_by_user_id": user1.id,
            "robot_id": robots[0].id,
        },
        {
            "document_name": "Lab Reports",
            "sender": "Dr. Smith",
            "recipient": "Maria Santos",
            "pickup_location": "Nantes Building",
            "dropoff_location": "Main Building",
            "status": "in_transit",
            "requested_by_user_id": user2.id,
            "robot_id": robots[1].id,
        },
        {
            "document_name": "Committee Meeting Minutes",
            "sender": "Office of VP for Academic Affairs",
            "recipient": "Department Heads",
            "pickup_location": "Main Building",
            "dropoff_location": "CCIS Building",
            "status": "pending_request",
            "requested_by_user_id": user1.id,
        },
        {
            "document_name": "Research Proposal",
            "sender": "Dr. Lee",
            "recipient": "Research Director",
            "pickup_location": "Research Office",
            "dropoff_location": "Dean's Office",
            "status": "delivered",
            "requested_by_user_id": user2.id,
            "robot_id": robots[2].id,
        },
    ]

    deliveries = []
    for data in deliveries_data:
        delivery = Delivery(
            document_name=data["document_name"],
            sender=data["sender"],
            recipient=data["recipient"],
            pickup_location=data["pickup_location"],
            dropoff_location=data["dropoff_location"],
            status=data["status"],
            requested_by_user_id=data["requested_by_user_id"],
            robot_id=data.get("robot_id"),
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(hours=1),
        )
        deliveries.append(delivery)

    db.session.add_all(deliveries)
    db.session.commit()
    print(f"✅ Created {len(deliveries)} test deliveries")

    print("\n✅ Database seeding completed successfully!")
