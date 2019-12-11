const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUrlDatabase = {
  b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "userRandomID" },
  Gsm5xK: { longURL: "https://www.google.com", userID: "userRandomID" },
  Qf0Ri3: { longURL: "https://github.com", userID: "user2RandomID" },
  Ar6Gy7: { longURL: "https://developer.mozilla.org", userID: "user2RandomID" },
  b6UTxQ: { longURL: "https://developer.mozilla.org", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  y0Nocm: { longURL: "https://www.twitch.tv", userID: "aJ48lW" },
  fglH5v: { longURL: "https://www.freecodecamp.org", userID: "aJ48lW" }
};
const testUsersDatabase = {
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

describe("getUserByEmail", function() {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsersDatabase);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});
