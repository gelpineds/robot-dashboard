from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, bcrypt, cors, socketio, mail


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JSON_SORT_KEYS'] = False
    app.url_map.strict_slashes = False

    # Initialize CORS FIRST before registering routes
    # Build allowed origins from defaults plus any FRONTEND_URL(s) provided in env
    default_origins = [
        "http://localhost:8000",
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    cfg_frontend = app.config.get('FRONTEND_URL') or ''
    extra_origins = []
    if cfg_frontend:
        # support comma-separated list in FRONTEND_URL env
        for part in cfg_frontend.split(','):
            p = part.strip()
            if p:
                extra_origins.append(p)

    # include common LAN/dev IPs on common frontend ports so devices on the LAN can connect
    common_ips = ["127.0.0.1", "0.0.0.0", "172.20.10.2", "26.114.248.191"]
    common_ports = ["8080", "8081", "8000", "3000", "5173"]
    common_lan = []
    for scheme in ("http", "https"):
        for ip in common_ips:
            for port in common_ports:
                origin = f"{scheme}://{ip}:{port}"
                if origin not in common_lan:
                    common_lan.append(origin)

    # Merge lists while preserving order and avoiding duplicates
    allowed_origins = []
    for lst in (default_origins, extra_origins, common_lan):
        for o in lst:
            if o and o not in allowed_origins:
                allowed_origins.append(o)

    cors.init_app(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Initialize other extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    # Register blueprints AFTER CORS is initialized
    from app.routes.auth import auth_bp
    from app.routes.robots import robots_bp
    from app.routes.deliveries import deliveries_bp
    from app.routes.telemetry import telemetry_bp
    from app.routes.alerts import alerts_bp
    from app.routes.users import users_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(robots_bp, url_prefix="/api/robots")
    app.register_blueprint(deliveries_bp, url_prefix="/api/deliveries")
    app.register_blueprint(telemetry_bp, url_prefix="/api/telemetry")
    app.register_blueprint(alerts_bp, url_prefix="/api/alerts")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    # Initialize Flask-Admin BEFORE SocketIO
    from app.admin import init_admin
    init_admin(app)

    # Initialize SocketIO LAST so it wraps everything properly
    # Use the same allowed_origins for SocketIO CORS
    socketio.init_app(
        app,
        cors_allowed_origins=allowed_origins,
        cors_credentials=True
    )

    # SocketIO: join personal room on authentication
    from flask_socketio import join_room, emit, disconnect
    from flask_jwt_extended import decode_token

    @socketio.on('connect')
    def handle_connect():
        print("[SocketIO] Client connection attempt")
        # Don't emit here - let the connection complete first
        return True

    @socketio.on('disconnect')
    def handle_disconnect(reason=None):  
        print(f"[SocketIO] Client disconnected: {reason}")

    @socketio.on('authenticate')
    def handle_authenticate(data):
        # Frontend emits 'authenticate' with { token: jwtToken } after connecting
        try:
            token = data.get('token') if data else None
            if not token:
                emit('auth_error', {'error': 'No token provided'})
                return False
            
            decoded = decode_token(token)
            # The identity is stored as 'sub' in the JWT
            user_id = int(decoded.get('sub', decoded.get('identity')))
            join_room(f'user_{user_id}')
            print(f"[SocketIO] User {user_id} authenticated and joined room user_{user_id}")
            emit('authenticated', {'status': 'ok', 'user_id': user_id, 'room': f'user_{user_id}'})
            return True
        except Exception as e:
            print(f"[SocketIO] Authentication error: {str(e)}")
            try:
                emit('auth_error', {'error': str(e)})
            except Exception as emit_err:
                print(f"[SocketIO] Failed to emit auth_error: {str(emit_err)}")
            return False

    @socketio.on_error_default
    def default_error_handler(e):
        import traceback
        print(f"[SocketIO] Unhandled error: {str(e)}")
        print(f"[SocketIO] Traceback:\n{traceback.format_exc()}")

    @app.route("/")
    def home():
        return {"message": "Robot Monitoring Backend API is running"}

    @app.errorhandler(Exception)
    def handle_error(error):
        import traceback
        import sys
        error_trace = traceback.format_exc()
        print(f"\n[Flask] Unhandled error: {str(error)}", file=sys.stderr)
        print(f"[Flask] Type: {type(error).__name__}", file=sys.stderr)
        print(f"[Flask] Traceback:\n{error_trace}", file=sys.stderr)
        sys.stderr.flush()
        return {"error": f"Internal server error: {str(error)}"}, 500

    return app