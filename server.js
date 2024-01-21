const express = require("express");
const session = require("express-session");
const User = require("./models/user");
let app = express();

app.use(express.static("public/static"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "some secret here",
    cookie: { maxAge: 30 * 60 * 1000 }, //the cookie will expire in 50 seconds
    resave: true,
    saveUninitialized: true,
  })
); // now we have req.session object

// add pug to app
app.set("views", "public");
app.set("view engine", "pug");

// handle request
app.get("/", loginPage);
app.post("/login", login);
app.get("/logout", logout);

let usersRouter = require("./router/users-router");
app.use("/users", usersRouter);

let artworksRouter = require("./router/artworks-router");
app.use("/artworks", artworksRouter);

// 404 handler
app.use((req, res, next) => {
  res.format({
    "text/html": () => {
      res.render("pages/404", {});
    },
  });
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");

// handle login page request
function loginPage(req, res, next) {
  res.format({
    "text/html": () => {
      res.render("pages/login", {});
    },
  });
}

function login(req, res, next) {
  if (req.session.userId) {
    res.status(200).send("Already logged in.");
    return;
  }

  let user = req.body;

  User.find(user)
    .then((results) => {
      // did not find the user
      if (results.length == 0) {
        res.status(401).send("Unauthorized");
        return;
      }
      // we keep track of what user this session belongs to
      req.session.userId = results[0]._id;
      req.session.username = results[0].username;
      // get the user role
      if (results[0].artist) {
        req.session.artist = true;
      } else {
        req.session.artist = false;
      }
      res.status(200).send();
    })
    .catch((err) => {
      throw err;
    });
}

function logout(req, res, next) {
  if (req.session.userId) {
    req.session.userId = undefined;
    req.session.username = undefined;
    req.session.artist = undefined;
    res.status(200).send("Logged out.");
  } else {
    res.status(200).send("You cannot log out because you aren't logged in.");
  }
}
