#!/usr/bin/env python
"""Clear all user accounts from the database"""

from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    user_count = User.query.count()
    print(f"🗑️  Clearing {user_count} user account(s) from the database...")
    
    User.query.delete()
    db.session.commit()
    
    print("✅ All user accounts cleared successfully!")
    print("\nYou can now:")
    print("1. Register a new user at /login (click 'Sign up')")
    print("2. Or use the REGISTRATION_CODE to create fresh accounts")
