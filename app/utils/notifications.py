from app.extensions import db, socketio
from app.models.notification import Notification
from datetime import datetime, timezone


def create_notification(user_id, type, title, message, link=None, is_action_required=False):
    """
    Create a notification in the DB and emit it via SocketIO to the recipient.
    Call this from any route that triggers a notification.

    Returns the created Notification object.
    """
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
        is_action_required=is_action_required,
    )
    db.session.add(notif)
    db.session.commit()

    # Emit to the specific user's SocketIO room
    # Frontend joins room 'user_{id}' on connect
    socketio.emit(
        'new_notification',
        notif.to_dict(),
        room=f'user_{user_id}',
        namespace='/'
    )

    return notif