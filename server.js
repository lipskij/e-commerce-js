const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require("./user");
const salt = 10;
const port = process.env.SECRET || 3000;
const Favorite = require('./favorites');

app.use(bodyParser.json());

// app.use(serveStatic('/static', { 'index': ['index.html', 'index.htm'] }))
app.use(express.static('static'))

app.use(cookieSession({
  name: 'session',
  secret: process.env.SECRET,
  maxAge: 24 * 60 * 60 * 1000,
}))

app.get('/profile', function (req, res) {
  User.findAll({
    attributes: ["username"],
    where: {
      id: req.session.userId,
    },
  }).then((users) => {
    res.send(users[0]);
  });
})

app.get('/logout', function (req, res) {
  req.session = null;
  res.redirect('/');
})
// app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));
// app.get("/style.css", (req, res) => res.sendFile(`${__dirname}/style.css`));
// app.get("/styles2.css", (req, res) => res.sendFile(`${__dirname}/styles2.css`));
// app.get("/script.js", (req, res) => res.sendFile(`${__dirname}/script.js`));
// app.get("/signup.html", (req, res) => res.sendFile(`${__dirname}/signup.html`));
// app.get("/app.js", (req, res) => res.sendFile(`${__dirname}/app.js`));


app.post("/signup", (req, res) => {
  const user = User.findAll({
    where: {
      username: req.body.username,
    },
  }).then((users) => {
    if (users.length > 0) {
      res.status(400).send("This user name already exist");
    } else {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        const newUser = User.build({
          username: req.body.username,
          email: req.body.email,
          password: hash,
        });
        newUser.save().then(() => res.send());
      });
    }
  });
});

app.post("/login", (req, res) => {
  User.findAll({
    attributes: ["password"],
    where: {
      username: req.body.username,
    },
  }).then((users) => {
    if (users.length === 0) {
      res.status(401).json({ username: "User not found" });
    } else {
      bcrypt.compare(req.body.password, users[0].password, function (
        err,
        result
      ) {
        if (result === true) {
          User.findAll({
            attributes: ["id", "username"],
            where: {
              username: req.body.username,
            },
          }).then((users) => {
            req.session.username = users[0].username;
            req.session.userId = users[0].id;
            res.redirect('/');
            // res.send(users[0]);
          });
        } else {
          res.status(401).json({ password: "Invalid password" });
        }
      });
    }
  });
});

app.post('/favorites', (req, res) => {
  const newFavorites = Favorite.build({
    productId: req.body.productId,
    userId: req.session.userId,
  });
  newFavorites.save().then(() => res.send()).catch(() => {
    res.sendStatus(400);
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
