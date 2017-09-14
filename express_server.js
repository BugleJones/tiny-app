"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser() );

///////DATA/////////

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "J24601": "http://www.twitter.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

////////LOCALS/////////

app.use((request, response, next) => {
  response.locals = {
    urls: urlDatabase,
    user: users[request.cookies.user_id]
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

//////////(URLS MAIN PAGE)//////

app.get("/urls", (request, response) => {
  // let templateVars = {
  //   urls: urlDatabase,
  //   user: request.cookies.users_id
  // };
  response.render("urls_index");
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

////////(URLS/NEW PAGE)//////////////

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
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

  let userRandomId = generateRandomString();
  users[userRandomId] = {
    id: userRandomId,
    email: userEmail,
    password: userPassword
  };
  response.cookie("user_id", users[userRandomId].id);
  response.redirect("/urls");
});

//////////(LOGIN PAGE)////////

app.get("/login", (request, response) => {
  response.render("login");
});

app.post("/login", (request, response) => {
  let user = findUserByEmail(request.body.email);
  if (!user || request.body.password !== user.password) {
    response.status(403);
    response.render("login", { error: "Not found" });
  }
    response.cookie("user_id", user.id);
    response.redirect("/urls");
});

//////////(LOGOUT OPTION)////////

app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/login");
});

//////////(URL SPECIFIC PAGE)////////

app.post("/urls/:id", (request, response) => {
  let newLongUrl = request.body.longURL;
  let currentURL = request.params.id;

  urlDatabase[currentURL] = newLongUrl;

  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = urlDatabase[request.params.id];
  if (urlDatabase[request.params.id] === undefined) {
    response.status(404);
    response.send("404 Error");
  }
  response.render("urls_show", { shortURL, longURL });
});

app.get("/u/:shortURL", (request, response) => {
  if (urlDatabase[request.params.shortURL] === undefined) {
    response.redirect(404, "/urls/new");
  } else {
    let longURL = urlDatabase[request.params.shortURL];
    response.redirect(longURL);
}
});

//////(URL DELETE OPTION)////////////

app.post("/urls/:id/delete", (request, response) => {
  let currentKey = request.params.id;
  delete urlDatabase[currentKey];
  response.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
