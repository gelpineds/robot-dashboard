from flask import Blueprint, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db, bcrypt
from app.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    # 1. Parse fields
    username = data.get("username")
    email = data.get("email")
    full_name = data.get("full_name")
    password = data.get("password")
    room = data.get("room")
    registration_code = data.get("registration_code", "").strip()

    # 2. Validate registration code — must happen before anything else
    if not registration_code:
        return {"error": "Registration code is required."}, 400
    if registration_code != current_app.config["REGISTRATION_CODE"]:
        return {"error": "Invalid registration code. Please contact your administrator."}, 403

    # 3. Force role to 'user' — admins are created manually, never via self-registration
    role = data.get("role", "user")
    if role == "admin":
        role = "user"

    # 4. Required field validation
    if not username or not email or not full_name or not password:
        return {"error": "username, email, full_name, and password are required"}, 400

    # 5. Duplicate username check
    if User.query.filter_by(username=username).first():
        return {"error": "Username already exists"}, 409

    # 6. Duplicate email check
    if User.query.filter_by(email=email).first():
        return {"error": "Email already exists"}, 409

    # 7. Hash password
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    # 8. Create user and commit
    user = User(
        username=username,
        email=email,
        full_name=full_name,
        password_hash=password_hash,
        role=role,
        room=room
    )

    db.session.add(user)
    db.session.commit()

    # 9. Return success response
    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "room": user.room
        }
    }, 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "username and password are required"}, 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return {"error": "Invalid username or password"}, 401

    if not user.is_active:
        return {"error": "This account is inactive"}, 403

    if not bcrypt.check_password_hash(user.password_hash, password):
        return {"error": "Invalid username or password"}, 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "username": user.username,
            "full_name": user.full_name
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "room": user.room
        }
    }, 200


@auth_bp.get("/test")
def auth_test():
    return {"message": "Auth route working"}, 200


@auth_bp.get("/me")
@jwt_required()
def get_current_user():
    """Get the currently logged-in user's information"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return {"error": "User not found"}, 404

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "room": user.room
    }, 200