import os
from app import app, db

def reset_database():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        print("Database successfully reset to the new schema!")

if __name__ == '__main__':
    reset_database()
