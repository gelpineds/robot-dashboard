#!/usr/bin/env python
"""Add initial robots for testing - run this AFTER registering your user"""

from app import create_app, db
from app.models.robot import Robot

app = create_app()

with app.app_context():
    # Check if robots exist
    existing = Robot.query.count()
    if existing > 0:
        print(f"⚠️  {existing} robots already exist in the database")
        response = input("Do you want to delete them and start fresh? (yes/no): ").lower()
        if response == "yes":
            Robot.query.delete()
            db.session.commit()
            print("✅ Existing robots deleted")
        else:
            print("Exiting without changes")
            exit()

    # Create robots
    robots_data = [
        {"name": "PUP-BOT Unit 1", "status": "online", "location": "Main Building", "battery_level": 95},
        {"name": "PUP-BOT Unit 2", "status": "online", "location": "CCIS Building", "battery_level": 80},
        {"name": "PUP-BOT Unit 3", "status": "online", "location": "Nantes Building", "battery_level": 60},
        {"name": "PUP-BOT Unit 4", "status": "charging", "location": "Charging Station", "battery_level": 25},
        {"name": "PUP-BOT Unit 5", "status": "offline", "location": "Maintenance", "battery_level": 10},
    ]

    robots = []
    for data in robots_data:
        robot = Robot(
            name=data["name"],
            status=data["status"],
            location=data["location"],
            battery_level=data["battery_level"],
            temperature=22.5,
        )
        robots.append(robot)

    db.session.add_all(robots)
    db.session.commit()
    print(f"✅ Added {len(robots)} robots to the system")
    print("\nAvailable robots:")
    for robot in robots:
        print(f"  • {robot.name} ({robot.status}) - Battery: {robot.battery_level}%")
