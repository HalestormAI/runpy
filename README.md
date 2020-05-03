# README

An app to visualise and analyse running data from Strava. A toy project, not intended to do all that much or be particularly useful.

Currently limited to only a single user, who must create an [API accound](https://developers.strava.com/) and fill out the config in the backend with its details.

This is currently set up as two main components:

  1. **[backend](backend/README.md)**, written in Python, which handles interaction with the Strava API as well as all the database integration.
  2. **[frontend](frontend/README.md)**, written in React. Displays data in a few different ways. Uses [Plotly](https://plotly.com/javascript/) for visualising data and [Leaflet](https://leafletjs.com/) for mapping.
  
The whole application is backed by a MongoDB database, which caches a bunch of data from the Strava API. Aggregations are then performed over the data to produce the visulisations.

There's a [Trello Board](https://trello.com/b/4yFRn4aS/runpy) for the project, which outlines some of the stuff still TODO.
