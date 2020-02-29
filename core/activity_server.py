from flask import Flask

from core.config import Config
from resources import activity_search, activity_dl, frontend
from running_stats import register_handlers

config = Config.create_instance("config.json")


def create_app(config_filename):
    app = Flask(__name__)
    app.config.from_object(config_filename)

    activity_search.blueprint(app)
    activity_dl.blueprint(app)
    frontend.blueprint(app)
    return app


if __name__ == "__main__":
    register_handlers()
    print("Creating app")
    app = create_app(config['server']['config_file'])
    print("Running app")
    app.run(debug=True)
