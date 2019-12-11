const bcrypt = require("bcrypt");

//Function to look up user based emails
const getUserByEmail = function(email, userDatabase) {
  for (el in userDatabase) {
    if (userDatabase[el].email === email) {
      return userDatabase[el].id;
    }
  }
  return false;
};

//Function to generate random alphanumeric string, length 6
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

//Function to look up hashed password
function getUserByPassword(password, userDatabase) {
  for (let el in userDatabase) {
    if (bcrypt.compareSync(password, userDatabase[el].password)) {
      return true;
    }
  }
  return false;
}

//Function to return the proper user id based on email and password
function getUserById(req, userDatabase) {
  for (let el in userDatabase) {
    if (
      userDatabase[el].email === req.body.email &&
      bcrypt.compareSync(req.body.password, userDatabase[el].password)
    ) {
      return userDatabase[el].id;
    }
  }
  return false;
}

//Function to filter out url specific to user id
function urlsForUser(id, urlDatabase) {
  let result = {};
  for (let el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      result[el] = urlDatabase[el];
    }
  }
  return result;
}
module.exports = {
  getUserByEmail,
  generateRandomString,
  getUserByPassword,
  getUserById,
  urlsForUser
};
