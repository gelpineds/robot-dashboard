from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from app.extensions import db
from app.models.notification import Notification
from app.utils.notifications import create_notification
from app.utils.response import success_response, error_response

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()

    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    limit = int(request.args.get('limit', 50))

    query = Notification.query.filter_by(user_id=current_user_id)

    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()

    unread_count = Notification.query.filter_by(
        user_id=current_user_id, is_read=False
    ).count()

    return success_response({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    })


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_user_id = get_jwt_identity()

    unread_count = Notification.query.filter_by(
        user_id=current_user_id, is_read=False
    ).count()

    return success_response({'unread_count': unread_count})


@notifications_bp.route('/<int:notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(notification_id):
    current_user_id = get_jwt_identity()

    notif = Notification.query.get_or_404(notification_id)

    if notif.user_id != current_user_id:
        return error_response('Unauthorized', 403)

    notif.is_read = True
    notif.read_at = datetime.now(timezone.utc)
    db.session.commit()

    return success_response({'notification': notif.to_dict()})


@notifications_bp.route('/mark-all-read', methods=['PATCH'])
@jwt_required()
def mark_all_read():
    current_user_id = get_jwt_identity()

    marked_count = Notification.query.filter_by(
        user_id=current_user_id, is_read=False
    ).update({
        'is_read': True,
        'read_at': datetime.now(timezone.utc)
    })

    db.session.commit()

    return success_response({'marked_count': marked_count})


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()

    notif = Notification.query.get_or_404(notification_id)

    if notif.user_id != current_user_id:
        return error_response('Unauthorized', 403)

    db.session.delete(notif)
    db.session.commit()

    return success_response({'message': 'Notification deleted'})