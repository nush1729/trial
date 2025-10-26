from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Make sure CORS is set to your frontend port (8080)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})

    db.init_app(app)

    # Register the API endpoints from routes.py
    app.register_blueprint(api, url_prefix='/api')

    with app.app_context():
        # This block is now intentionally empty because the database is set up via the SQL script.
        # The 'pass' keyword prevents the IndentationError.
        pass
        
    return app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    # Runs the app on port 5000 in debug mode
    app.run(debug=True, port=5000)