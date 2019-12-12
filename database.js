const bcrypt = require("bcrypt");

//Fake "databases"
const urlDatabase = {
  b2xVn2: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "userRandomID",
    visits: 0,
    uniqueVisits: []
  },
  Gsm5xK: {
    longURL: "https://www.google.com",
    userID: "userRandomID",
    visits: 0,
    uniqueVisits: []
  },
  Qf0Ri3: {
    longURL: "https://github.com",
    userID: "user2RandomID",
    visits: 0,
    uniqueVisits: []
  },
  Ar6Gy7: {
    longURL: "https://www.npmjs.com",
    userID: "user2RandomID",
    visits: 0,
    uniqueVisits: []
  },
  b6UTxQ: {
    longURL: "https://developer.mozilla.org",
    userID: "aJ48lW",
    visits: 0,
    uniqueVisits: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visits: 0,
    uniqueVisits: []
  },
  y0Nocm: {
    longURL: "https://www.twitch.tv",
    userID: "aJ48lW",
    visits: 0,
    uniqueVisits: []
  },
  fglH5v: {
    longURL: "https://www.freecodecamp.org",
    userID: "aJ48lW",
    visits: 0,
    uniqueVisits: []
  }
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

module.exports = { urlDatabase, users };
