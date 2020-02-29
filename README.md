# RunPy -  Strava Analysis in Flask

Reimagining of Currere to use Python (Flask) backend for pulling running stats.

To run:

  * Copy `config-example.json` to `config.json`, then add your Strava API keys to it
  * Install requirements: `$ pip3 install -r requirements.txt`
  * Run the server `$ python3 activity_server.py`

Once the server is running, go to the following in your browser:

    http://127.0.0.1:5000/frontend/display.html

## TODO:
### README
 * Add Strava API instructions
 * More detailed setup instructions
 * Description of config and server config
 * Explanation of what the app actually does
 * Information on `stravaio` fork

### Server
 * ~~Move from flat-file JSON to Mongo~~
 * More filters to use for searching database
   * Gear
   * Name
   * Location (e.g. runs within radius of lat/long)
 * Better download API with progress responses -> SocketIO / flask-socketio
 * Clean up commented code = mostly used for test histograms, needs to be removed in lieu of a frontend
 * Restructure scripts - currently not well organised

### Frontend
 * Make a frontend....
 * Start with a static HTML5 page, use `fetch` api to query the server and send results to `plotly`
 * Move towards React?
