from app.extensions import db
from datetime import datetime, timezone


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)

    # Who receives this notification
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Notification type — determines icon and color on frontend
    # Values: 'delivery_created' | 'robot_dispatched' | 'robot_arrived' |
    #         'delivery_completed' | 'robot_low_battery' | 'robot_offline' |
    #         'delivery_cancelled'
    type = db.Column(db.String(50), nullable=False)

    # Short title shown in panel (e.g. "Delivery #DEL-001 arrived")
    title = db.Column(db.String(255), nullable=False)

    # Longer description shown below title
    message = db.Column(db.Text, nullable=False)

    # Optional link — frontend navigates here when notification is tapped
    # e.g. '/track/123' or '/robots'
    link = db.Column(db.String(255), nullable=True)

    # Whether this notification requires user action
    # True for: robot_arrived (recipient must confirm receipt)
    # False for everything else
    is_action_required = db.Column(db.Boolean, default=False, nullable=False)

    # Read state
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)

    # Timestamps
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    read_at = db.Column(db.DateTime, nullable=True)

    # Relationship back to user
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'link': self.link,
            'is_action_required': self.is_action_required,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'read_at': self.read_at.isoformat() if self.read_at else None,
        }

    def __repr__(self):
        return f'<Notification {self.id} [{self.type}] user={self.user_id} read={self.is_read}>'