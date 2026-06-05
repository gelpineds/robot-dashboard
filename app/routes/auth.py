#auth.py
from flask import Blueprint, request, current_app, session, redirect, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from app.extensions import db, bcrypt, mail
from app.models.user import User
from urllib.parse import urlparse
import secrets

auth_bp = Blueprint("auth", __name__)


def _is_safe_redirect_url(url: str) -> bool:
    parsed = urlparse(url)
    return not parsed.scheme and not parsed.netloc and url.startswith("/")


def send_verification_email(user):
    frontend_url = current_app.config["FRONTEND_URL"]
    verify_link = f"{frontend_url}/verify-email?token={user.verification_token}"

    msg = Message(
        subject="Verify your PUP Deliver account",
        recipients=[user.email],
        html=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2 style="color: #800000;">PUP Deliver</h2>
            <p>Hi <strong>{user.full_name}</strong>,</p>
            <p>Thanks for registering! Please verify your email address to activate your account.</p>
            <a href="{verify_link}"
               style="display:inline-block; padding: 12px 24px; background:#800000;
                      color:#FFD700; text-decoration:none; border-radius:8px;
                      font-weight:bold; margin: 16px 0;">
                Verify Email
            </a>
            <p style="color:#888; font-size:12px;">
                If you didn't register, you can ignore this email.<br/>
                Link expires after use.
            </p>
        </div>
        """
    )
    mail.send(msg)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    full_name = data.get("full_name")
    password = data.get("password")
    room = data.get("room")
    registration_code = data.get("registration_code", "").strip()

    if not registration_code:
        return {"error": "Registration code is required."}, 400
    if registration_code != current_app.config["REGISTRATION_CODE"]:
        return {"error": "Invalid registration code. Please contact your administrator."}, 403

    role = data.get("role", "user")
    if role == "admin":
        role = "user"

    if not username or not email or not full_name or not password:
        return {"error": "username, email, full_name, and password are required"}, 400

    if User.query.filter_by(username=username).first():
        return {"error": "Username already exists"}, 409

    if User.query.filter_by(email=email).first():
        return {"error": "Email already exists"}, 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    verification_token = secrets.token_urlsafe(32)  # NEW

    user = User(
        username=username,
        email=email,
        full_name=full_name,
        password_hash=password_hash,
        role=role,
        room=room,
        is_verified=False,                      # NEW
        verification_token=verification_token   # NEW
    )

    db.session.add(user)
    db.session.commit()

    # Send verification email
    try:
        send_verification_email(user)
    except Exception as e:
        # Don't fail registration if email fails — just log it
        current_app.logger.error(f"Failed to send verification email: {e}")

    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "room": user.room,
            "is_verified": user.is_verified
        }
    }, 201


@auth_bp.get("/verify-email")
def verify_email():
    """Verify email using token from the link"""
    token = request.args.get("token")

    if not token:
        return {"error": "Verification token is required."}, 400

    user = User.query.filter_by(verification_token=token).first()

    if not user:
        return {"error": "Invalid or expired verification token."}, 404

    if user.is_verified:
        return {"message": "Email already verified."}, 200

    user.is_verified = True
    user.verification_token = None  # Invalidate token after use
    db.session.commit()

    return {"message": "Email verified successfully. You can now log in."}, 200


@auth_bp.post("/login")
def login():
    try:
        data = request.get_json()
        if data is None:
            return {"error": "Request body must be JSON"}, 400
    except Exception as e:
        return {"error": f"Failed to parse JSON: {str(e)}"}, 400

    username_or_email = data.get("email") or data.get("username")
    password = data.get("password")

    if not username_or_email:
        return {"error": "email or username is required"}, 400
    if not password:
        return {"error": "password is required"}, 400

    user = User.query.filter_by(email=username_or_email).first()
    if not user:
        user = User.query.filter_by(username=username_or_email).first()

    if not user:
        return {"error": "Invalid username or password"}, 401

    if not user.is_active:
        return {"error": "This account is inactive"}, 403

    # Block unverified users from logging in
    if not user.is_verified:
        return {"error": "Please verify your email before logging in."}, 403

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


@auth_bp.post("/admin-login")
def admin_login():
    """Admin login endpoint that creates a session for Flask-Admin access"""
    try:
        data = request.get_json()
        if data is None:
            return {"error": "Request body must be JSON"}, 400
    except Exception as e:
        return {"error": f"Failed to parse JSON: {str(e)}"}, 400

    # Accept either email or username
    username_or_email = data.get("email") or data.get("username")
    password = data.get("password")

    if not username_or_email:
        return {"error": "email or username is required"}, 400
    
    if not password:
        return {"error": "password is required"}, 400

    # Try to find user by email first, then by username
    user = User.query.filter_by(email=username_or_email).first()
    if not user:
        user = User.query.filter_by(username=username_or_email).first()

    if not user:
        return {"error": "Invalid username or password"}, 401

    if user.role != 'admin':
        return {"error": "Admin access required"}, 403

    if not user.is_active:
        return {"error": "This account is inactive"}, 403

    if not bcrypt.check_password_hash(user.password_hash, password):
        return {"error": "Invalid username or password"}, 401

    # Set session for Flask-Admin
    session['admin_user_id'] = user.id
    session['admin_username'] = user.username
    session.permanent = True

    return {
        "message": "Admin login successful",
        "redirect": "/admin/",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }, 200


@auth_bp.get("/admin-login")
def admin_login_page():
    raw_next = request.args.get("next", "/admin/")

    # SECURITY: Validate next_url to prevent open redirect and reflected XSS.
    # Only allow relative paths on this host; fall back to /admin/ otherwise.
    next_url = raw_next if _is_safe_redirect_url(raw_next) else "/admin/"

    # Pass next_url to JS via a data attribute, never by direct f-string
    # interpolation into a script block, to prevent XSS injection.
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Login</title>
        <style>
            body {{ font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }}
            .box {{ background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 300px; }}
            h2 {{ margin-top: 0; }}
            input {{ width: 100%; padding: 8px; margin: 8px 0 16px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }}
            button {{ width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }}
            button:hover {{ background: #0056b3; }}
            .error {{ color: red; font-size: 0.9rem; }}
        </style>
    </head>
    <body>
        <div class="box" data-next="{next_url}">
            <h2>Robot Monitor Admin</h2>
            <div id="error" class="error"></div>
            <input id="username" type="text" placeholder="Username or Email" />
            <input id="password" type="password" placeholder="Password" />
            <button onclick="doLogin()">Login</button>
        </div>
        <script>
            async function doLogin() {{
                // Read the redirect target from the DOM, not from an inline JS string,
                // so user-supplied input is never executed as code.
                const nextUrl = document.querySelector('.box').dataset.next;
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const res = await fetch('/api/auth/admin-login', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    credentials: 'include',
                    body: JSON.stringify({{ username, password }})
                }});
                const data = await res.json();
                if (res.ok) {{
                    window.location.href = nextUrl;
                }} else {{
                    document.getElementById('error').textContent = data.error || 'Login failed';
                }}
            }}
        </script>
    </body>
    </html>
    """, 200