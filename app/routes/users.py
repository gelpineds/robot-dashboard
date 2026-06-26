from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.utils.decorators import admin_required

users_bp = Blueprint("users", __name__)


@users_bp.get("/")
@jwt_required()
@admin_required()
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
            "floor": user.floor,
            "room": user.room,
        }
        for user in users
    ], 200


@users_bp.get("/search")
@jwt_required()
def search_users():
    """Search users by name, email, username, or room.
    An empty query returns all active users (excluding the requester)."""
    current_user_id = int(get_jwt_identity())
    query = request.args.get("q", "").strip()

    base = User.query.filter_by(is_active=True).filter(User.id != current_user_id)
    users = base.order_by(User.full_name.asc()).limit(20).all()

    if query:
        base = base.filter(
            (User.full_name.ilike(f"%{query}%")) |
            (User.username.ilike(f"%{query}%")) |
            (User.email.ilike(f"%{query}%")) |
            (User.room.ilike(f"%{query}%"))
        )

    users = base.order_by(User.full_name.asc()).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "floor": user.floor,
            "room": user.room,
        }
        for user in users
    ], 200

@users_bp.get("/<int:user_id>")
@jwt_required()
@admin_required()
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
        "floor": user.floor,
        "room": user.room,
    }, 200


@users_bp.put("/<int:user_id>")
@jwt_required()
@admin_required()
def update_user(user_id):
    """Update a user account from the admin panel"""
    user = User.query.get(user_id)

    if not user:
        return {"error": "User not found"}, 404

    data = request.get_json() or {}

    allowed_fields = ["username", "email", "full_name", "role", "floor", "room", "is_active"]

    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "floor": user.floor,
            "room": user.room,
            "is_active": user.is_active,
        }
    }, 200


@users_bp.delete("/<int:user_id>")
@jwt_required()
@admin_required()
def delete_user(user_id):
    """Delete a user account from the admin panel"""
    current_admin_id = int(get_jwt_identity())

    if user_id == current_admin_id:
        return {"error": "You cannot delete your own account"}, 400

    user = User.query.get(user_id)

    if not user:
        return {"error": "User not found"}, 404

    db.session.delete(user)
    db.session.commit()

    return {"message": "User deleted successfully"}, 200
