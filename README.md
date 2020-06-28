This app allows an user to register using an email and a password which meets a criteria. The user will receive an email with a 6-digit confirmation code. 

Only the first time the user attempts to login it will be asked to enter the confirmation code. 

When an user logs in, an expirying session will be stored in the mongoose database containing a cookie and the user's ID. A cookie containing the session ID will be set in the browser. No other data is stored in the cookie.

The routes are protected so that an user who is logged in cannot go to `/login` or `/register`. And a user who is not logged in can't go to the home route: `/`.

Technologies used:

- [express](https://expressjs.com/)
- [ejs](https://ejs.co/)
- [mongoose](https://mongoosejs.com/)
- [express-session](https://github.com/expressjs/session)
- [connect-mongo](https://github.com/jdesboeufs/connect-mongo)
- [helmet](https://helmetjs.github.io/)
- [nodemailer](https://nodemailer.com/about/)
- [pbkdf2Sync](https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest)

You must run

``` sh
yarn install
```

and create a `.env` file in the root directory containing the following:

```
MONGODB_URI=mongodb://localhost/yourDB
SESSION_SECRET=<A random string>
EMAIL_PASSWORD=<Email password>
EMAIL=<An email>
NODE_ENV=development
```

Made by Diego Ramos