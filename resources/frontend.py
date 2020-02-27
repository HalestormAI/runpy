from flask import Blueprint


def blueprint(app):
    api_bp = Blueprint('frontend', __name__, static_folder="../frontend")
    app.register_blueprint(api_bp)
