
var express = require('express');
var router = express.Router();
var path = require('path');

const Client = require('pg').Client;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => console.log("Users database connected"))
  .catch(err => console.error("Database connection error:", err));

var passport = require('passport');
var bcrypt = require('bcryptjs');

/* GET users listing - preserved from main */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Logout */
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.log("Unable to logout:", err);
      return next(err);
    }
    res.redirect('/');
  });
});

/* Check if user is logged in */
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

/* User profile */
router.get('/profile', loggedIn, function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'profile.html'));
});

/* Check if user is not logged in */
function notLoggedIn(req, res, next) {
  if (!req.user) {
    next();
  } else {
    let prefer = req.user.prefer;
    res.redirect('/users/profile?name=' + encodeURIComponent(prefer));
  }
}

/* Login page */
router.get('/login', notLoggedIn, function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

/* Process login */
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/users/login?message=Incorrect+credentials'
  }),
  function(req, res) {
    let prefer = req.user.prefer;
    console.log("Preferred Name:", prefer);
    res.redirect('/users/profile?name=' + encodeURIComponent(prefer));
  }
);

/* Signup page */
router.get('/signup', function(req, res) {
  if (req.user) {
    let prefer = req.user.prefer;
    return res.redirect('/users/profile?name=' + encodeURIComponent(prefer));
  }

  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

/* Create user */
function createUser(req, res, next) {
  var salt = bcrypt.genSaltSync(10);
  var password = bcrypt.hashSync(req.body.password, salt);

  client.query(
    'INSERT INTO users (username, password, fullname, prefer) VALUES($1, $2, $3, $4)',
    [
      req.body.username,
      password,
      req.body.fullname,
      req.body.prefer
    ],
    function(err, result) {
      if (err) {
        console.log("Unable to insert user:", err);
        return next(err);
      }

      console.log("User created successfully");

      res.redirect('/users/login?message=We+created+your+account+successfully!');
    }
  );
}

/* Process signup */
router.post('/signup', function(req, res, next) {
  client.query(
    'SELECT * FROM users WHERE username=$1',
    [req.body.username],
    function(err, result) {
      if (err) {
        console.log("SQL error:", err);
        return next(err);
      }

      if (result.rows.length > 0) {
        console.log("User already exists");
        return res.redirect('/users/signup?error=User+exists');
      }

      console.log("Creating new user");
      createUser(req, res, next);
    }
  );
});

module.exports = router;
