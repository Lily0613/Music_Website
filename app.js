
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Environment configuration
require('dotenv').config();

// Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Session management
var session = require('express-session');

// PostgreSQL database connection
const Client = require('pg').Client;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect();

// Password encryption
var bcrypt = require('bcryptjs');

// Passport authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
function(username, password, done) {
  client.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
    function(err, result) {
      if (err) {
        console.log("SQL error", err);
        return done(null, false, { message: 'SQL error' });
      }

      if (result.rows.length > 0) {
        let matched = bcrypt.compareSync(
          password,
          result.rows[0].password
        );

        if (matched) {
          console.log("Successful login");
          return done(null, result.rows[0]);
        }
      }

      return done(null, false, {
        message: 'Bad username or password'
      });
    }
  );
}));

// Store user information in session
passport.serializeUser(function(user, done) {
  return done(null, user);
});

// Retrieve user information from session
passport.deserializeUser(function(user, done) {
  return done(null, user);
});

// Express middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Application routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
