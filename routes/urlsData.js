const express = require("express");
const router = express.Router();
const { urlDatabase } = require("../database");
const { generateRandomString, urlsForUser } = require("../helpers");
//////////////////
//GET Requests
//Index Page
router.get("/", (req, res) => {
  if (req.session.user_id === undefined || req.session.user_id === null) {
    res.redirect("/login");
    return;
  }
  if (req.session.user_id !== undefined || req.session.user_id !== null) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      username: res.locals.user,
      error: null
    };
    res.render("urls_index", templateVars);
    return;
  }
});
//New Page
router.get("/new", (req, res) => {
  if (req.session.user_id === undefined || req.session.user_id === null) {
    res.redirect("/login");
    return;
  }
  const templateVars = { username: res.locals.user, error: null };
  res.render("urls_new", templateVars);
});
//ShortURL Page
router.get("/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  if (
    urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL] ===
    undefined
  ) {
    res.status(404).render("404", { username: res.locals.user, error: null });
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: res.locals.user,
    visits: urlDatabase[req.params.shortURL].visits || 0,
    uniqueVisits: urlDatabase[req.params.shortURL].uniqueVisits.length,
    timeStamp: urlDatabase[req.params.shortURL].history || null,
    error: null
  };
  res.render("urls_show", templateVars);
});
//////////////////
//POST Requests
//Index Page
router.post("/", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visits: 0,
    uniqueVisits: [],
    history: null
  };
  res.redirect("/urls");
});

module.exports = router;
