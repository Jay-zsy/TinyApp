//Dependencies
const express = require("express");
const app = express();
const userRoutes = require("./routes/usersData");
const urlsRoutes = require("./routes/urlsData");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
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

//////////////////
//Time stamp middle ware
const requestTime = function(req, res, next) {
  const timeStamp = new Date(Date.now());
  req.session.timeStamp = timeStamp.toString();
  next();
};
app.use("/u/:shortURL", requestTime);

//Auth middleware
app.use((req, res, next) => {
  res.locals.user = users[req.session.user_id];
  next();
});
//////////////////

app.use("/urls", urlsRoutes);
app.use("/", userRoutes);

//Redirect
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404).render("404", { username: res.locals.user, error: null });
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
  urlDatabase[req.params.shortURL].history = req.session.timeStamp;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//Edit ShortURL method
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).render("403", { username: res.locals.user, error: null });
  }
});
//Delete method
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).render("403", { username: res.locals.user, error: null });
  }
});
//Listen @ port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
