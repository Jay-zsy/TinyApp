const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { users } = require("../database");
const {
  getUserByEmail,
  generateRandomString,
  getUserByPassword,
  getUserById
} = require("../helpers");
//////////////////
//GET Requests
//Login Page
router.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { username: res.locals.user, error: null };
  res.render("login_page", templateVars);
});
//Logout Page
router.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
//Reg Page
router.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { username: res.locals.user, error: null };
  res.render("registration_page", templateVars);
});
//////////////////
//POST Requests
//Login Method
router.post("/login", (req, res) => {
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
//Logout Method
router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//Reg Method
router.post("/register", (req, res) => {
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

module.exports = router;
