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

// Get songs based on selected mood
router.get('/songs/:mood', async function(req, res, next) {
    try {
        const mood = req.params.mood.trim();

        const result = await client.query(
            'SELECT * FROM songs WHERE TRIM(mood) ILIKE $1',
            [mood]
        );

        console.log("Requested mood:", mood);
        console.log("Number of songs:", result.rows.length);

        res.json(result.rows);

    } catch (err) {
        next(err);
    }
});


module.exports = router;

