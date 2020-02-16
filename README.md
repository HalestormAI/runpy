# RunPy -  Strava Analysis in Flask

Reimagining of Currere to use Python (Flask) backend for pulling running stats
To run:

  * Copy `config-example.json` to `config.json`, then add your Strava API keys to it
  * Install requirements: `$ pip3 install -r requirements.txt`
  * Run the server `$ python3 activity_server.py`


## TODO:
### README
 * Add Strava API instructions
 * More detailed setup instructions
 * Description of config and server config
 * Explanation of what the app actually does
 * Information on `stravaio` fork

### Server
 * More filters to use for searching database
 * Move from flat-file JSON to Mongo
 * Better download API with progress responses
 * Clean up commented code = mostly used for test histograms, needs to be removed in lieu of a frontend
 * Restructure scripts - currently not well organised

### Frontend
 * Make a frontend....
 * Start with a static HTML5 page, use `fetch` api to query the server and send results to `plotly`
 * Move towards React?
