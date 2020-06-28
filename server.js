// Only grab SECRET environment variables from .env
// if not running on production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express() // initialize express
const { join } = require('path') // for \ vs / OS paths
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const helmet = require('helmet')

// Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet())

// setup view engine
app.set('view engine', 'ejs')

// Body parser middleware, handle JSON
app.use(express.json())

// handle form submitions middleware
app.use(express.urlencoded({ extended: false }))

// Set a static folder
app.use(express.static(join(__dirname, 'public')))


// -------------- ENVIRONMENT VARIABLES ----------------
// In a production environment like heroku, the SECRET environment
// variables can be set in the user interface or through a cli.
// The other option is to store the SECRETS in a .env file (less safe).
const {
  // DEFAULT values for development
  PORT = 3000,
  NODE_ENV,
  // EQUALS 2 HOURS = (1000 ms * 60 sec * 60 min * 2 hr)
  SESSION_LIFETIME = 1000 * 60 * 60 * 2,
  SESSION_NAME = 'id',
  // SECRET environment variables
  SESSION_SECRET, // Random string
  MONGODB_URI // mongodb://localhost/database_name
} = process.env

// -------------- DATABASE ----------------
// Connect to the database
mongoose.connect(MONGODB_URI, {

  // mongoose options to avoid deprecation warnings
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

mongoose.connection.on('error', err => console.error(err))
mongoose.connection.on('connected', () => {
  console.log(`Connected to the ${NODE_ENV} database.`)
})

// -------------- SESSIONS ----------------
// All the sessions will be saved in the 'sessions'
// collection of the database
// https://github.com/expressjs/session#readme
app.use(session({
  name: SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
  }),
  cookie: {
    maxAge: SESSION_LIFETIME,
    sameSite: true
    // if NODE_ENV in production, session.cookie.secure = true
    // HTTPS is necessary for secure cookies.
    // secure: NODE_ENV === 'production'
  }
}))

// Save the USER object to res.locals
// https://expressjs.com/en/api.html#res.locals
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl,
    req.session.user ? req.session.user : 'guest user')

  // res.locals is a special object is shared among the middlewares
  if (req.session.user) {
    // Upon every request, populate res.locals.user
    // with the user's id
    res.locals.user = req.session.user
  } else {
    res.locals.user = null
  }
  next()
})

// -------------- FLASH MESSAGES ----------------
app.use(['/login', '/register'], (req, res, next) => {
  // If there's a flash message in the req.session,
  // pass it to res.locals, then delete it.
  res.locals.flash = req.session.flash
  delete req.session.flash
  next()
})

// Import and use routers
app.use('/', require('./routes/index'))

app.listen(PORT, console.log(`Listening on http://localhost:${PORT}`))
