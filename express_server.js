//Dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  generateRandomString,
  getUserByPassword,
  getUserById,
  urlsForUser
} = require("./helpers");
const { urlDatabase, users } = require("./database");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["omegalul"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.set("view engine", "ejs");
//GET routes
//Login
app.get("/login", (req, res) => {
  const templateVars = { username: users[req.session.user_id] };
  res.render("login_page", templateVars);
});
//Logout
app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`http://localhost:8080/urls`);
});
//Reg
app.get("/register", (req, res) => {
  const templateVars = { username: users[req.session.user_id] };
  res.render("registration_page", templateVars);
});
//Index page
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    username: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
//New page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  const templateVars = { username: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});
//ShortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  if (
    urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL] ===
    undefined
  ) {
    res
      .status(404)
      .send("This short URL doesn't belong to you or it doesnt exist");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});
//Redirect
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res
      .status(404)
      .send("This short URL doesn't belong to you or it doesnt exist");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//POST routes
//Index page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`http://localhost:8080/urls`);
});
//Edit ShortURL method
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.status(403).send("You're an idiot!");
  }
});
//Delete method
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.status(403).send("You're an idiot!");
  }
});
//Login page
app.post("/login", (req, res) => {
  if (
    getUserByEmail(req.body.email, users) &&
    getUserByPassword(req.body.password, users)
  ) {
    req.session.user_id = getUserById(req, users);
    res.redirect(`http://localhost:8080/urls`);
    return;
  }
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send("Email can not be found");
  }
  if (
    getUserByEmail(req.body.email, users) &&
    !getUserByPassword(req.body.password, users)
  ) {
    res.status(403).send("Wrong password");
  }
});
//Logout method
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`http://localhost:8080/urls`);
});
//Reg
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("None shall pass");
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("Email already exist");
  }
  const userID = generateRandomString();
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userID;
  res.redirect(`http://localhost:8080/urls`);
});
//Listen @ port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
