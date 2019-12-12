//Dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
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
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//////
const requestTime = function(req, res, next) {
  const timeStamp = new Date(Date.now());
  req.session.timeStamp = timeStamp.toString();
  next();
};

app.use("/u/:shortURL", requestTime);
//////

//GET routes
//Login
app.get("/login", (req, res) => {
  const templateVars = { username: users[req.session.user_id], error: null };
  res.render("login_page", templateVars);
});
//Logout
app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
//Reg
app.get("/register", (req, res) => {
  const templateVars = { username: users[req.session.user_id], error: null };
  res.render("registration_page", templateVars);
});
//Index page
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined || req.session.user_id === null) {
    const templateVars = {
      urls: urlDatabase,
      username: users[req.session.user_id],
      error: null
    };
    res.render("login_page", templateVars);
    return;
  }
  if (req.session.user_id !== undefined || req.session.user_id !== null) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      username: users[req.session.user_id],
      error: null
    };
    res.render("urls_index", templateVars);
    return;
  }
});
//New page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined || req.session.user_id === null) {
    res.redirect("/login");
    return;
  }
  const templateVars = { username: users[req.session.user_id], error: null };
  res.render("urls_new", templateVars);
});
//ShortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  if (
    urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL] ===
    undefined
  ) {
    res
      .status(404)
      .render("404", { username: users[req.session.user_id], error: null });
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.session.user_id],
    visits: urlDatabase[req.params.shortURL].visits || 0,
    uniqueVisits: urlDatabase[req.params.shortURL].uniqueVisits.length,
    timeStamp: req.session.timeStamp || null,
    error: null
  };
  res.render("urls_show", templateVars);
});
//Redirect
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res
      .status(404)
      .render("404", { username: users[req.session.user_id], error: null });
    return;
  }
  if (req.session.user_id) {
    if (
      !urlDatabase[req.params.shortURL].uniqueVisits.includes(
        req.session.user_id
      )
    ) {
      urlDatabase[req.params.shortURL].uniqueVisits.push(req.session.user_id);
    }
  }
  urlDatabase[req.params.shortURL].visits += 1;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//POST routes
//Index page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visits: 0,
    uniqueVisits: []
  };
  res.redirect("/urls");
});
//Edit ShortURL method
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .render("403", { username: users[req.session.user_id], error: null });
  }
});
//Delete method
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .render("403", { username: users[req.session.user_id], error: null });
  }
});
//Login page
app.post("/login", (req, res) => {
  if (
    getUserByEmail(req.body.email, users) &&
    getUserByPassword(req.body.password, users)
  ) {
    req.session.user_id = getUserById(req, users);
    res.redirect("/urls");
    return;
  }
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).render("login_page", {
      username: null,
      error: "Wrong password or email!"
    });
    return;
  }
  if (
    getUserByEmail(req.body.email, users) &&
    !getUserByPassword(req.body.password, users)
  ) {
    res.status(403).render("login_page", {
      username: null,
      error: "Wrong password or email!"
    });
    return;
  }
});
//Logout method
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//Reg
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).render("registration_page", {
      username: null,
      error: "Please enter valid values!"
    });
    return;
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).render("registration_page", {
      username: null,
      error: "Email already exist!"
    });
    return;
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
  res.redirect("/urls");
});
//Listen @ port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
