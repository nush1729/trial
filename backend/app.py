# In backend/app.py
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})
    db.init_app(app)
    app.register_blueprint(api, url_prefix='/api')

    # THE 'with' BLOCK AND 'db.create_all()' ARE NOW REMOVED
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)