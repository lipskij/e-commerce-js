const express = require("express");
const serveStatic = require('serve-static')
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require("./user");
const salt = 10;
const port = 3000;

app.use(bodyParser.json());

// app.use(serveStatic('/static', { 'index': ['index.html', 'index.htm'] }))
app.use(express.static('static'))

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
            res.redirect('/')
            res.send(users[0]);
          });
        } else {
          res.status(401).json({ password: "Invalid password" });
        }
      });
    }
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
