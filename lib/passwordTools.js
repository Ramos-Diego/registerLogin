// Node.js cryptography library
const { pbkdf2Sync, randomBytes } = require('crypto')

// pbkdf2Sync iterations
// DANGER: If this is changed all previously
// saved password won't be verifiable
const iterations = 100000

// Be very careful modifying this function.
// Only the the iterations should be changed.
exports.generateHash = (password) => {
  // Generate a salt string in hexadecimal
  const salt = randomBytes(32).toString('hex')

  // Derive key for new user
  const derivedKey = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex')

  return {
    hash: derivedKey,
    salt: salt
  }
}

exports.validatePassword = (password, hash, salt) => {
  // --- Password-Based Key Derivation Function 2 ----
  // The time to verify a single password should be
  // 241 ms (4 passwords per second). Adjust the number of
  // iterations for the server to reach this benchmark.
  // Tweak up or down 100,000 iterations.
  // Ref: https://security.stackexchange.com/questions/3959/recommended-of-iterations-when-using-pkbdf2-sha256
  const startTime = new Date()
  const derivedKey = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex')
  const endTime = new Date()
  // Time difference in ms
  const elapsed = endTime - startTime
  console.log(`Time elapsed to verify a single password = ${elapsed} ms`)

  return hash === derivedKey
}
