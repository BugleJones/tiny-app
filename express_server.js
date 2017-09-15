"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  //secret: "HugeApp",
  keys: ["Tiniest App", "Small App", "Mini App"],
}));

///////DATA/////////

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$mCFtBhM5XcaXn3dYE4xNHOSX7.GYjuw3LUtGtnPvERr1HgIewB9.6" //dinosaur
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$SdUyJoHt5Pgk4XU7/G5/pOa4n2WR3RWHdTfb1iY2f7cVb.PI2dWXi" //dishwasher
  }
};

let urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"},
  "J24601": {longURL: "http://www.twitter.com", userID: "user2RandomID"}
};

////////LOCALS/////////

app.use((request, response, next) => {
  response.locals = {
    urls: urlDatabase,
    longURL: urlDatabase[request.params.id],
    user: users[request.session.user_id]
  };
  next();
});

//////////USEFUL FUNCTIONS///////////

function generateRandomString() {
  let newShortURL = "";
  let possibleValues = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWxXxYyZz0123456789";

  for (let i = 0; i < 6; i++) {
    newShortURL += possibleValues.charAt(Math.floor(Math.random() * possibleValues.length));
  }
  return newShortURL;
}

function findUserByEmail(userEmail) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  }
}

function getUrlsForUser(userID) {
  const myUrls = {};
  for (let shortUrl in urlDatabase) {
    // console.log("my conditions:", urlDatabase[shortUrl].userID, userID)
    if (urlDatabase[shortUrl].userID === userID) {
      myUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return myUrls;
}

function createUser(email, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  return id;
}

//////////(URLS MAIN PAGE)//////

app.get("/urls", (request, response) => {
  const urls = getUrlsForUser(request.session.user_id);
  if (!request.session.user_id) {
    response.status(401);
    response.render("login");
    return;
  }
  response.render("urls_index", { urls });
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
     longURL: request.body.longURL,
     userID: request.session.user_id
   };
  response.redirect(`/urls/${shortURL}`);
});

////////(URLS/NEW PAGE)//////////////

app.get("/urls/new", (request, response) => {
  const urls = getUrlsForUser(request.session.user_id);
  if (!request.session.user_id) {
    response.status(401);
    response.render("login");
    return;
  }
  response.render("urls_new", { urls });
});


////////(REGISTER PAGE)///////////

app.get("/register", (request, response) => {
  response.render("register");
});

app.post("/register", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;

  if ((!userEmail) && (!userPassword)) {
    response.status(400);
    response.send("Please enter an email and a password");
    return;
  }
  if (!userPassword) {
    response.status(400);
    response.send("Please enter a password");
    return;
  }
  if (!userEmail) {
    response.status(400);
    response.send("Please enter an email");
    return;
  }
  if (findUserByEmail(userEmail, users)) {
    response.status(400);
    //Do we want this to prove that an account exists already though?
    response.send("Already taken, please enter a new email");
    return;
  }

  const id = createUser(userEmail, userPassword);

  request.session.user_id = id;
  response.redirect("/urls");
});

//////////(LOGIN PAGE)////////

app.get("/login", (request, response) => {
  response.render("login");
});

app.post("/login", (request, response) => {
  let user = findUserByEmail(request.body.email);
  if (!user || !bcrypt.compareSync(request.body.password, user.password)) {
    response.status(403);
    response.redirect("/login", { error: "Not found" });
    return;
  }
  request.session.user_id = user.id;
  response.redirect("/urls");
});

//////////(LOGOUT OPTION)////////

app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/login");
});

//////////(URL SPECIFIC PAGE)////////

app.post("/urls/:id", (request, response) => {
  let newLongUrl = request.body.longURL;
  let currentURL = request.params.id;
  const urls = getUrlsForUser(request.session.user_id);
  if (!request.session.user_id) {
    response.status(401);
    response.redirect("/login");
    return;
  }
  urlDatabase[currentURL].longURL = newLongUrl;
  console.log("our urlDatabse is", urlDatabase);
  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  const shortURL = request.params.id;
  const longURL = urlDatabase[request.params.id];
  const urls = getUrlsForUser(request.session.user_id);
  if (!request.session.user_id) {
    response.status(401);
    response.render("login");
    return;
  }
  if (urlDatabase[request.params.id] === undefined) {
    response.status(404);
    response.send("404 Error");
    return;
  }
  response.render("urls_show", { shortURL, longURL, urls });
});

app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.id;
  const longURL = urlDatabase[request.params.id];
  if (urlDatabase[request.params.shortURL] === undefined) {
    response.redirect(404, "/urls/new");
  } else {
    let longURL = urlDatabase[request.params.shortURL];
    response.redirect(longURL);
  }
});

//////(URL DELETE OPTION)////////////

app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  if (request.session.user_id !== urlDatabase[shortURL].userID) {
    response.status(401);
    response.render("urls_index");
    return;
  }
  delete urlDatabase[shortURL];
  response.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
