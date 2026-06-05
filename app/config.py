import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES = 86400
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///robot_monitoring.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REGISTRATION_CODE = os.environ.get("REGISTRATION_CODE", "ITECH2026")

    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400

    # Gmail SMTP
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")       # your Gmail address
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")       # Gmail App Password
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")