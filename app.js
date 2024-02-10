const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require("connect-flash");
const ejs = require('ejs');

// Initialize Express app
const app = express();

// Configure view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash()); 

// Session middleware
app.use(session({ 
    secret: '4598520122', // Add a secret key for session encryption
    resave: true,
    saveUninitialized: true 
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/health');

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

// Define the validPassword method on the User model
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

// Define User model
const User = mongoose.model("User", userSchema);

// Passport serialization and deserialization
passport.serializeUser(function(user, done) {
    done(null, user.id); 
});
passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Passport local strategy
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });

            if (!user) {
                return done(null, false, { message: "User not found" });
            }

            if (!user.validPassword(password)) {
                return done(null, false, { message: "Incorrect password" });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));
// Get request 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

app.get('/signUp.html', (req, res) => {
    res.sendFile(__dirname + '/signUp.html'); 
});

app.get('/registration', (req, res) => {
    res.sendFile(__dirname + '/registration.html'); 
});

app.get('/docSignUp.html', (req, res) => {
    res.sendFile(__dirname + '/docSignUp.html'); 
});

app.get('/doctor_registration', (req, res) => {
    res.sendFile(__dirname + '/doctor_registration.html'); 
});




