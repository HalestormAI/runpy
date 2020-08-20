# README

An app to visualise and analyse running data from Strava. A toy project, not intended to do all that much or be particularly useful.

Currently limited to only a single user, who must create an [API accound](https://developers.strava.com/) and fill out the config in the backend with its details.

This is currently set up as two main components:

  1. **[backend](backend/README.md)**, written in Python, which handles interaction with the Strava API as well as all the database integration.
  2. **[frontend](frontend/README.md)**, written in React. Displays data in a few different ways. Uses [Plotly](https://plotly.com/javascript/) for visualising data and [Leaflet](https://leafletjs.com/) for mapping.
  
The whole application is backed by a MongoDB database, which caches a bunch of data from the Strava API. Aggregations are then performed over the data to produce the visulisations.

There's a [Trello Board](https://trello.com/b/4yFRn4aS/runpy) for the project, which outlines some of the stuff still TODO.


## Some screenshots:


The frontpage showing stats evolving over time (binned data by week/month):

![Frontpage - stats evolving over time](readme-content/temporal-stats-frontpage.png/?raw=true "Frontpage - stats evolving over time")

Temporal stats (raw data):

![Temporal stats with raw data](readme-content/raw-pace.png/?raw=true "Temporal stats with raw data")

Moving average with trend-line:

![Moving average with trend-line](readme-content/weekly-distance-with-trend.png/?raw=true "Moving average with trend-line")

Heatmap of pace/frequency based on binned location:

![Pace/location heatmap](readme-content/heatmap.png/?raw=true "location heatmap")
