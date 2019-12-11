const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "userRandomID" },
  Gsm5xK: { longURL: "https://www.google.com", userID: "userRandomID" },
  Qf0Ri3: { longURL: "https://github.com", userID: "user2RandomID" },
  Ar6Gy7: { longURL: "https://developer.mozilla.org", userID: "user2RandomID" },
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

app.get("/login", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("login_page", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("registration_page", templateVars);
});

app.get("/urls", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("http://localhost:8080/login");
    return;
  }
  if (urlsForUser(req.cookies.user_id)[req.params.shortURL] === undefined) {
    res
      .status(404)
      .send("This short URL doesn't belong to you or it doesnt exist");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.status(403).send("You're an idiot!");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.status(403).send("You're an idiot!");
  }
});

app.post("/login", (req, res) => {
  if (emailLookUp(req) && passwordLookUp(req)) {
    res.cookie("user_id", userIdLookUp(req));
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
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  res.cookie("user_id", userID);
  console.log(users);
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
    if (bcrypt.compareSync(req.body.password, users[el].password)) {
      return true;
    }
  }
  return false;
}

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

function urlsForUser(id) {
  let result = {};
  for (let el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      result[el] = urlDatabase[el];
    }
  }
  return result;
}
