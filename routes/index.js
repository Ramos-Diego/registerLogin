const express = require('express')
const router = express.Router()
const {
  mustBeLoggedIn,
  mustNotBeLoggedIn,
  loginUser,
  registerUser,
  logoutUser
} = require('../lib/authMiddleware')
const User = require('../models/userSchema')

// -------------- HOME ----------------
router.get('/', mustBeLoggedIn, (req, res) => {
  // Get the user object from the database based on
  // the id, but only pass the email to the client.
  User.findById(res.locals.user)
    .then(user => {
      res.render('index.ejs', { email: user.email })
    })
    .catch((err) => console.error(err))
})

// -------------- LOGIN ----------------
router.get('/login', mustNotBeLoggedIn, (req, res) => {
  res.render('login.ejs', { flash: res.locals.flash })
})

router.post('/login', mustNotBeLoggedIn, loginUser)

// -------------- REGISTER ----------------
router.get('/register', mustNotBeLoggedIn, (req, res) => {
  res.render('register.ejs', { flash: res.locals.flash })
})

router.post('/register', mustNotBeLoggedIn, registerUser)

// -------------- LOGOUT ----------------
router.get('/logout', mustBeLoggedIn, logoutUser)

module.exports = router
