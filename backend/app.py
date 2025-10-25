from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS to allow requests from your React frontend
    # Adjust the "origins" if your frontend runs on a different port
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    db.init_app(app)

    # Register the API endpoints from routes.py
    app.register_blueprint(api, url_prefix='/api')

    with app.app_context():
        # This command creates the database tables based on your models.py definitions
        # It will only create tables that don't already exist.
        db.create_all()
        
    return app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    # Runs the app on port 5000 in debug mode
    app.run(debug=True, port=5000)