import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///robot_monitoring.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REGISTRATION_CODE = os.environ.get("REGISTRATION_CODE", "ITECH2026")
    
    # Session configuration for Flask-Admin
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours