require('dotenv').config();
const bodyParser = require('body-parser');
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require('md5');
// var encrypt = require('mongoose-encryption');

mongoose.connect('mongodb://127.0.0.1:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const app = express()
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'))


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// userSchema.plugin(encrypt, {secret: process.env.encKey, encryptedFields:['password']})

const User = mongoose.model('user', userSchema);

app.get('/', function(req, res){
  return res.render('home')
})

app.route('/login')
  .get(function(req, res){
  return res.render('login')
  })
  .post(function(req, res){
    const username = req.body.username;
    const pass = md5(req.body.password);
    
    User.findOne({email:username}, function(err, foundUser){
      if(err) return err
      
      if(foundUser){
        if(foundUser.password===pass){
          return res.render('secrets')
        }
      }
    })
  })

app.get('/secrets', function(req, res){
  return res.render('secrets')
})


app.route('/register')
.get(function(req, res){
  return res.render('register')
})
.post(function(req, res){
  const email = req.body.username;
  const password = req.body.password;

  const newUser = new User({
    email:email,
    password: md5(password)
  })

newUser.save(function(err){
  if(err) return err
  return res.redirect('secrets')
})
  
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
