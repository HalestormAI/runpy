import logging
import sys

from flask import Flask
from flask_cors import CORS

from .core.config import Config
from .core.running_stats import register_handlers
from .resources import activity_search, activity_dl, frontend, geo_search, aggregated_search, activity_transformer
from .transforms import register_transforms

logger = logging.getLogger("runpy")
config = Config.get_instance()


def setup_logger():
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)


def create_app(config_filename):
    app = Flask(__name__)
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config.from_pyfile(config_filename)

    activity_search.blueprint(app)
    activity_dl.blueprint(app)
    frontend.blueprint(app)
    geo_search.blueprint(app)
    aggregated_search.blueprint(app)
    activity_transformer.blueprint(app)
    return app


if __name__ == "__main__":
    setup_logger()
    register_handlers()
    register_transforms()
    print("Creating app")
    app = create_app(config['server']['config_file'])
    print("Running app")
    app.run(debug=True)
