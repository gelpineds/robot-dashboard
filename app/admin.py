from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask import redirect, url_for, request, session
from app.extensions import db


class AuthenticatedAdminIndexView(AdminIndexView):
    """Custom admin index view that requires session-based authentication"""
    
    def is_accessible(self):
        print(f"[Admin] is_accessible called, session keys: {list(session.keys())}")
        result = 'admin_user_id' in session
        print(f"[Admin] is_accessible returning: {result}")
        return result
    
    def inaccessible_callback(self, name, **kwargs):
        print(f"[Admin] inaccessible_callback called, name={name}, request.url={request.url}")
        try:
            redirect_url = url_for('auth.admin_login', next=request.url)
            print(f"[Admin] Redirecting to: {redirect_url}")
            return redirect(redirect_url)
        except Exception as e:
            print(f"[Admin] Error in inaccessible_callback: {str(e)}")
            import traceback
            traceback.print_exc()
            raise


class ProtectedModelView(ModelView):
    """Base model view with session-based authentication protection"""
    
    def is_accessible(self):
        return 'admin_user_id' in session
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('auth.admin_login', next=request.url))


class UserAdmin(ProtectedModelView):
    """Admin interface for User model"""
    column_list = ('id', 'email', 'username', 'role', 'created_at')
    column_searchable_list = ('email', 'username')
    column_filters = ('role', 'created_at')
    can_delete = False  # Prevent accidental user deletion


class RobotAdmin(ProtectedModelView):
    """Admin interface for Robot model"""
    column_list = ('id', 'name', 'status', 'battery_level', 'location', 'updated_at')
    column_searchable_list = ('name',)
    column_filters = ('status', 'updated_at')


class DeliveryAdmin(ProtectedModelView):
    """Admin interface for Delivery model"""
    column_list = ('id', 'document_name', 'status', 'recipient', 'robot_id', 'created_at')
    column_searchable_list = ('document_name', 'recipient')
    column_filters = ('status', 'created_at')


class AlertAdmin(ProtectedModelView):
    """Admin interface for Alert model"""
    column_list = ('id', 'alert_type', 'severity', 'message', 'robot_id', 'created_at')
    column_searchable_list = ('message', 'alert_type')
    column_filters = ('severity', 'alert_type', 'created_at')


class TelemetryAdmin(ProtectedModelView):
    """Admin interface for Telemetry model"""
    column_list = ('id', 'robot_id', 'speed', 'battery_level', 'timestamp')
    column_filters = ('timestamp',)
    page_size = 50  # Show more rows since telemetry is high-volume


class NotificationAdmin(ProtectedModelView):
    """Admin interface for Notification model"""
    column_list = ('id', 'user_id', 'title', 'message', 'is_read', 'created_at')
    column_searchable_list = ('title', 'message')
    column_filters = ('is_read', 'created_at')


def init_admin(app):
    """Initialize Flask-Admin with all model views"""
    # Import models inside function to avoid circular import issues
    from app.models import User, Robot, Delivery, Alert, Telemetry, Notification

    admin = Admin(
        app,
        name='Robot Monitor',
        index_view=AuthenticatedAdminIndexView()
    )
    
    # Add model views with unique endpoints to avoid conflicts
    admin.add_view(UserAdmin(User, db.session, name='Users', endpoint='admin_users'))
    admin.add_view(RobotAdmin(Robot, db.session, name='Robots', endpoint='admin_robots'))
    admin.add_view(DeliveryAdmin(Delivery, db.session, name='Deliveries', endpoint='admin_deliveries'))
    admin.add_view(AlertAdmin(Alert, db.session, name='Alerts', endpoint='admin_alerts'))
    admin.add_view(TelemetryAdmin(Telemetry, db.session, name='Telemetry', endpoint='admin_telemetry'))
    admin.add_view(NotificationAdmin(Notification, db.session, name='Notifications', endpoint='admin_notifications'))
    
    return admin