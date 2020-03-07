import logging

import stravaio

from core.config import Config

logger = logging.getLogger("runpy")


class AuthenticationError(Exception):
    pass


class StravaConnectedObject(object):

    def __init__(self, config=None):
        if config is None:
            config = Config.instance
        self.config = config

        self.client = None
        self.athlete_id = None

    def connect(self, validate_token=True):
        try:
            self.client = self.get_client(validate=validate_token)
        except AuthenticationError as err:
            logger.error(str(err))
            return

    def get_client(self, recreate_token=False, validate=True):
        token = self.config.get_token(recreate_token)
        client = stravaio.StravaIO(access_token=token['access_token'])

        if not validate and recreate_token:
            logger.warning("Getting client with recreate on and validate off. Will ignore validate=False")
            validate = True

        if not validate:
            self.athlete_id = token['athlete']['id']
            return client

        # TODO: strava_oauth2 doesn't properly support token fresh, this'll have to do for now
        try:
            # Test the client to make sure the token's still valid
            logger.info("Validating token...")

            # TODO: The exception gets swallowed and this simply returns None. Other methods actually throw. Fix in fork
            athlete = client.get_logged_in_athlete()
            if athlete is None:
                raise AuthenticationError("Failed to read current athlete")
            self.athlete_id = athlete.id
            logger.info("Token valid, returning client")
            return client

        # TODO StravaIO doesn't expose its custom exception, which inherits directly from the Exception class so we have
        # to catch all here
        except Exception:
            logger.info("Token invalid - attempting to recreate")
            # If this is the first failure, we'll try again with a force-refresh on the token.
            # If not, error and give up.
            if recreate_token:
                raise AuthenticationError("Could not validate token, despite attempting a refresh.")
            return self.get_client(recreate_token=True, validate=validate)