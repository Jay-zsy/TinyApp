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

app.get("/", (req, res) => {
  res.send("Hello! This is the default home page for our website");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
  res.cookie("username", req.body.username);
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
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
