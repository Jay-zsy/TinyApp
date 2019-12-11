const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "https://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com",
  Qf0Ri3: "https://github.com",
  Ar6Gy7: "https://developer.mozilla.org"
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/login", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("login_page", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("registration_page", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/login", (req, res) => {
  if (emailLookUp(req) && passwordLookUp(req)) {
    res.cookie("user_id", userIdLookUp(req));
    res.redirect(`http://localhost:8080/urls`);
  }
  if (!emailLookUp(req)) {
    res.status(403).send("Email can not be found");
  }
  if (emailLookUp(req) && !passwordLookUp(req)) {
    res.status(403).send("Wrong password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", users[req.cookies["user_id"]]);
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("None shall pass");
  }
  if (emailLookUp(req)) {
    res.status(400).send("Email already exist");
  }
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  res.cookie("user_id", userID);
  res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

function emailLookUp(req) {
  for (let el in users) {
    if (users[el].email === req.body.email) {
      return true;
    }
  }
  return false;
}

function passwordLookUp(req) {
  for (let el in users) {
    if (users[el].password === req.body.password) {
      return true;
    }
  }
  return false;
}

function userIdLookUp(req) {
  for (let el in users) {
    if (
      users[el].email === req.body.email &&
      users[el].password === req.body.password
    ) {
      return users[el].id;
    }
  }
}
