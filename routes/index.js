const path = require('path');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Connect to PostgreSQL
const Client = require('pg').Client;
const client = new Client({
    connectionString: process.env.DATABASE_URL
});

client.connect()
    .then(() => console.log("Connected to database"))
    .catch(err => console.error(err));


// Music Page
router.get('/music', function(req, res, next) {
  res.sendFile(path.join(__dirname,'..', 'public','music.html'));
});

// Retrieve songs from database based on the selected mood
router.get('/songs/:mood', async function(req, res, next) {

  // Retrieves the selected mood from the URL and queries the PostgreSQL database for all matching songs.
    try {
        const mood = req.params.mood.trim();

        // Sends request to the database to retrieve all songs that match the selected mood.
        const result = await client.query(
            'SELECT * FROM songs WHERE TRIM(mood) ILIKE $1',
            [mood]
        );

        // Displays which mood the user selected
        console.log("Requested mood:", mood);
        // Contains the records returned by the database
        console.log("Number of songs:", result.rows.length);

        //Sends the songs back to the webpage so js recieves the info and displays the songs on the webpage
        res.json(result.rows);

        //Handles errors
    } catch (err) {
        next(err);
    }
});


module.exports = router;

