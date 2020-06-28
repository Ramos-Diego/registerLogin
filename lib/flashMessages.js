module.exports = {
  registrationError: {
    path: '/register',
    type: 'error',
    message: 'Email already registered.'
  },
  loginError: {
    path: '/login',
    type: 'error',
    message: 'Email or password incorrect.'
  },
  passwordNotGood: {
    path: '/register',
    type: 'error',
    message: `Your password must have:
    <small>
    <ul>
      <li>one lower case English letter</li>
      <li>one upper case English letter</li>
      <li>one digit</li>
      <li>one special character: !@#$%^&*</li>
      <li>and be minimum 8, maximum 64 characters in length</li>
    </ul>
    </small>`
  },
  loginSuccess: {
    path: '/login',
    type: 'success',
    message: 'You\'re registered. Login now!'
  },
  verificationWarning: {
    path: '/login',
    type: 'warning',
    message: 'Please, enter the email verification code sent to your email.'
  }
}
