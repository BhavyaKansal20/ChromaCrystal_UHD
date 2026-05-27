from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class ImageJob(Base):
    __tablename__ = "image_jobs"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="pending")
    progress = Column(Float, default=0.0)
    original_filename = Column(String)
    result_filename = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)
