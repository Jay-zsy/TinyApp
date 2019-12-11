//Dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["omegalul"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.set("view engine", "ejs");
//Helper functions as follows:
//Function to generate random alphanumeric string, length 6
function generateRandomString() {
  let output = "";
  let i = 6;
  while (i) {
    let arr = [
      String.fromCharCode(Math.floor(Math.random() * 9 + 48)),
      String.fromCharCode(Math.floor(Math.random() * 25 + 97)),
      String.fromCharCode(Math.floor(Math.random() * 25 + 65))
    ];
    output += arr[Math.floor(Math.random() * 3)];
    i--;
  }
  return output;
}
//Function to look up emails
function emailLookUp(req) {
  for (let el in users) {
    if (users[el].email === req.body.email) {
      return true;
    }
  }
  return false;
}
//Function to look up hashed password
function passwordLookUp(req) {
  for (let el in users) {
    if (bcrypt.compareSync(req.body.password, users[el].password)) {
      return true;
    }
  }
  return false;
}
//Function to return the proper user id based on email and password
function userIdLookUp(req) {
  for (let el in users) {
    if (
      users[el].email === req.body.email &&
      bcrypt.compareSync(req.body.password, users[el].password)
    ) {
      return users[el].id;
    }
  }
}
//Function to filter out url specific to user id
function urlsForUser(id) {
  let result = {};
  for (let el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      result[el] = urlDatabase[el];
    }
  }
  return result;
}
//Fake "databases"
const urlDatabase = {
  b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "userRandomID" },
  Gsm5xK: { longURL: "https://www.google.com", userID: "userRandomID" },
  Qf0Ri3: { longURL: "https://github.com", userID: "user2RandomID" },
  Ar6Gy7: { longURL: "https://developer.mozilla.org", userID: "user2RandomID" },
  b6UTxQ: { longURL: "https://developer.mozilla.org", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  y0Nocm: { longURL: "https://www.twitch.tv", userID: "aJ48lW" },
  fglH5v: { longURL: "https://www.freecodecamp.org", userID: "aJ48lW" }
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "hollowic@hotmail.com",
    password: bcrypt.hashSync("123", 10)
  }
};
//GET routes
//Login
app.get("/login", (req, res) => {
  const templateVars = { username: users[req.session.user_id] };
  res.render("login_page", templateVars);
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
    urls: urlsForUser(req.session.user_id),
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
  if (urlsForUser(req.session.user_id)[req.params.shortURL] === undefined) {
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
  if (emailLookUp(req) && passwordLookUp(req)) {
    req.session.user_id = userIdLookUp(req);
    res.redirect(`http://localhost:8080/urls`);
    return;
  }
  if (!emailLookUp(req)) {
    res.status(403).send("Email can not be found");
  }
  if (emailLookUp(req) && !passwordLookUp(req)) {
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
  if (emailLookUp(req)) {
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
