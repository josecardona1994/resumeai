from sqlalchemy import create_engine, Column, String, JSON, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resumeai.db")
# Railway uses postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)          # Clerk user_id
    email = Column(String, unique=True, index=True)
    name = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Profile(Base):
    __tablename__ = "profiles"
    user_id = Column(String, primary_key=True)     # FK → users.id
    data = Column(JSON, default=dict)              # full profile dict
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
