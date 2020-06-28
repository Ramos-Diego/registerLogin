const User = require('../models/userSchema')
const { sendVerificationEmail } = require('../lib/emailTools')
const { validatePassword, generateHash } = require('../lib/passwordTools')
const {
  registrationError,
  loginError,
  passwordNotGood,
  loginSuccess,
  verificationWarning
} = require('../lib/flashMessages')

// ----------- CUSTOM AUTHENTICATION ------------
exports.mustBeLoggedIn = (req, res, next) => {
  !res.locals.user ? res.redirect('/login') : next()
}

exports.mustNotBeLoggedIn = (req, res, next) => {
  res.locals.user ? res.redirect('/') : next()
}

// -------------- LOGOUT USER ----------------
exports.logoutUser = (req, res, next) => {
  req.session.destroy(err => {
    if (err) { return res.redirect('/') }
    res.clearCookie('sid')
    res.redirect('/login')
  })
}

/* -------------------------------------------------
  -------- DANGER ZONE (PASSWORD HAZARD) ----------
  ------------------------------------------------- */

// ------------------------------------------
// -------------- LOGIN USER ----------------
// ------------------------------------------
exports.loginUser = (req, res, next) => {
  // --------- FLASH MESSAGE FUNCTION ----------
  const redirectAndFlash = (flashObject) => {
    req.session.flash = {
      type: flashObject.type,
      email: email,
      password: password,
      message: flashObject.message
    }
    return res.redirect(flashObject.path)
  }

  // Deconstruct the client form data
  const { email, password } = req.body

  // --------- AUTHENTICATE LOGIN -----------
  User.findOne({ email: email })
    .then(user => {
      // Show error if email is not found
      if (!user) { return redirectAndFlash(loginError) }

      // Validate password using pbkdf2Sync
      const isValid = validatePassword(password, user.hash, user.salt)

      if (!isValid) {
        redirectAndFlash(loginError)
      }

      if (isValid && !user.accountVerified) {
        // If verification code is correct, verify account
        if (+req.body.verificationCode === user.emailVerificationCode) {
          // Only update the verification fields
          User.findOneAndUpdate(
            { _id: user._id },
            { accountVerified: true, emailVerificationCode: null },
            { returnOriginal: false })
            .catch(err => console.error(err.errmsg))

          // Populate the session object with the user's ID and email.
          req.session.user = user._id

          return res.redirect('/')
        } else {
          return redirectAndFlash(verificationWarning)
        }
      }

      if (isValid && user.accountVerified) {
        // All checks were passed, redirect home
        // Populate the session object with the user's ID and email.
        req.session.user = user._id
        return res.redirect('/')
      }
    })
    .catch((err) => console.error(err))
}

// ---------------------------------------------
// -------------- REGISTER USER ----------------
// ---------------------------------------------
exports.registerUser = async (req, res, next) => {
  // -------- FLASH MESSAGE FUNCTION -----------
  const redirectAndFlash = (flashObject) => {
    req.session.flash = {
      type: flashObject.type,
      email: email,
      message: flashObject.message
    }
    return res.redirect(flashObject.path)
  }

  let { email, password } = req.body

  // This regex will enforce these rules:

  // At least one lower case English letter, (?=.*?[a-z])
  // At least one upper case English letter, (?=.*?[A-Z])
  // At least one digit, (?=.*\d)
  // At least one special character, (?=.*[!@#$%^&*])
  // Minimum 8, maximum 64 in length {8,64}
  const testCriteria = password =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,64}$/.test(password)

  // If the password does not meet the criteria
  // Prompt user to fulfill the criteria
  if (!testCriteria(password)) {
    return redirectAndFlash(passwordNotGood)
  }

  // Make all emails lowercase to avoid duplicates in the database
  email = email.toLowerCase()

  try {
    // Check if email is already in the database
    const emailExists = await User.exists({ email: email })

    // Proceed only if the email is not in the database
    if (!emailExists) {
      // Generate password hash and salt using pbkdf2Sync
      const newHash = generateHash(password)

      // Generate a random 6-digit number for email verification
      const emailCode = Math.floor((Math.random() * 900000) + 100000)

      // Generate new user object
      const userS = new User({
        email: email,
        hash: newHash.hash,
        salt: newHash.salt,
        emailVerificationCode: emailCode
      })

      // Save new user to the database
      await userS.save()

      // Send 6-digit email verification code
      sendVerificationEmail(email, emailCode)

      // pre-populate user's email to easily login
      return redirectAndFlash(loginSuccess)
    } else {
      // Handle email already saved in the database
      // Set the flash message to be sent along with the redirect
      redirectAndFlash(registrationError)
    }
  } catch (err) { console.error(err) }
}

/*  -------------------------------------------------
    ----- END OF DANGER ZONE (PASSWORD HAZARD) ------
    ------------------------------------------------- */
