const { assert } = require("chai");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  generateRandomString,
  getUserByPassword,
  getUserById,
  urlsForUser
} = require("../helpers.js");

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};
const testRequest = {
  body: {
    email: "fakeuser2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};
const testRequest2 = {
  body: {
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
/////
describe("getUserByEmail", function() {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsersDatabase);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});

describe("getUserByEmail", function() {
  it("should return a different user with valid email", () => {
    const user = getUserByEmail("user2@example.com", testUsersDatabase);
    const expectedOutput = "userRandomID";
    assert.notEqual(user, expectedOutput);
  });
});

describe("generateRandomString", function() {
  it("should return a random string that contains alphanumeric values", () => {
    const randomString = generateRandomString();
    const expectedOutput = /[A-z0-9]+/g;
    assert.match(randomString, expectedOutput);
  });
});

describe("generateRandomString", function() {
  it("should return a random string that has length of 6", () => {
    const randomString = generateRandomString();
    const expectedOutput = 6;
    assert.equal(randomString.length, expectedOutput);
  });
});

describe("getUserByPassword", function() {
  it("should return true", () => {
    const result = getUserByPassword("dishwasher-funk", testUsersDatabase);
    const expectedOutput = true;
    assert.equal(result, expectedOutput);
  });
});

describe("getUserByPassword", function() {
  it("should return false", () => {
    const result = getUserByPassword("randomfakepassword", testUsersDatabase);
    const expectedOutput = false;
    assert.equal(result, expectedOutput);
  });
});

describe("bcrypt", function() {
  it("should return different hash", () => {
    const firstHash = bcrypt.hashSync("dishwasher-funk", 10);
    const secondHash = bcrypt.hashSync("dishwasher-funk", 10);
    assert.notEqual(firstHash, secondHash);
  });
});

describe("bcrypt", function() {
  it("should return true", () => {
    const userInput = "dishwasher-funk";
    const storedPassword = testUsersDatabase.user2RandomID.password;
    const expectedOutput = true;
    assert.equal(bcrypt.compareSync(userInput, storedPassword), expectedOutput);
  });
});

describe("getUserById", function() {
  it("should return false due to an improper response", () => {
    const user = getUserById(testRequest, testUsersDatabase);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

describe("getUserById", function() {
  it("should return the second user ID", () => {
    const user = getUserById(testRequest2, testUsersDatabase);
    const expectedOutput = "user2RandomID";
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("should return 'https://developer.mozilla.org'", () => {
    const longURL = urlsForUser("aJ48lW", testUrlDatabase).b6UTxQ.longURL;
    const expectedOutput = "https://developer.mozilla.org";
    assert.equal(longURL, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("should return 4 objects", () => {
    const numberOfURLS = Object.keys(urlsForUser("aJ48lW", testUrlDatabase))
      .length;
    const expectedOutput = 4;
    assert.equal(numberOfURLS, expectedOutput);
  });
});
