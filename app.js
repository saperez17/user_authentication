require('dotenv').config();
const bodyParser = require('body-parser');
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
//Express session
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// var encrypt = require('mongoose-encryption');

const app = express()
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'))

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// userSchema.plugin(encrypt, {secret: process.env.encKey, encryptedFields:['password']})

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {

    return cb(err, user);
  });
}
));

app.get('/', function(req, res){
  return res.render('home')
})

app.route('/login')
  .get(function(req, res){
  return res.render('login')
  })
  .post(function(req, res){
    const username = req.body.username;
    const pass = req.body.password;
    const user = new User({
      username: username,
      password: pass
    })

    req.login(user, function(err){
      if(err){console.log(err)}
      return res.redirect('/secrets')
    })
  })

app.get('/auth/google', 
  passport.authenticate("google",{scope:['profile']})
  );

app.get('/auth/google/secrets', 
  passport.authenticate("google",{failureRedirect:'/login'}),
  function(req, res){
    res.redirect("/secrets");
  });


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

app.get('/secrets', function(req, res){
  if(req.isAuthenticated()){
    return res.render('secrets')
  }else{
    return res.render('login')
  }
})


app.route('/register')
.get(function(req, res){
 return res.render('register')
  
})
.post(function(req, res){

  const email = req.body.username;
  const password = req.body.password;

  User.register({username:email}, password, function(err, user){
    if(err){
      console.log(err);
      res.redirect('/register')
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })  
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
