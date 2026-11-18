
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
  res.sendFile(path.join(__dirname, '..', 'public', 'music.html'));
});

// Retrieve songs from database based on selected mood
router.get('/songs/:mood', async function(req, res, next) {
  try {
    // Gets the mood from the URL parameter and removes extra whitespace
    const mood = req.params.mood.trim();

    // Queries the database to find all songs that match the requested mood
    const result = await client.query(
      'SELECT * FROM songs WHERE TRIM(mood) ILIKE $1',
      [mood]
    );

    // Prints the requested mood in the console 
    console.log("Requested mood:", mood);
    // Prints the number of songs found in the database
    console.log("Number of songs:", result.rows.length);

    // Sends the matching songs back as a JSON response
    res.json(result.rows);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
