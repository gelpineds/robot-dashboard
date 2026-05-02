from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models.user import User

users_bp = Blueprint("users", __name__)


@users_bp.get("/")
@jwt_required()
def get_all_users():
    """Get list of all users"""
    users = User.query.filter_by(is_active=True).order_by(User.id.asc()).all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "room": user.room,
        }
        for user in users
    ], 200


@users_bp.get("/search")
@jwt_required()
def search_users():
    """Search users by name, email, username, or room"""
    query = request.args.get("q", "").strip()
    
    if not query or len(query) < 1:
        return {"error": "Search query required"}, 400
    
    # Search across multiple fields
    users = User.query.filter_by(is_active=True).filter(
        (User.full_name.ilike(f"%{query}%")) |
        (User.username.ilike(f"%{query}%")) |
        (User.email.ilike(f"%{query}%")) |
        (User.room.ilike(f"%{query}%"))
    ).order_by(User.full_name.asc()).all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "room": user.room,
        }
        for user in users
    ], 200


@users_bp.get("/<int:user_id>")
@jwt_required()
def get_user(user_id):
    """Get a specific user by ID"""
    user = User.query.get(user_id)
    
    if not user:
        return {"error": "User not found"}, 404
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "room": user.room,
    }, 200
