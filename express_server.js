"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser() );

// app.get("/views", require("views/mymiddleware.js"));

function generateRandomString() {
  let newShortURL = "";
  let possibleValues = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWxXxYyZz0123456789";

  for (let i = 0; i < 6; i++) {
    newShortURL += possibleValues.charAt(Math.floor(Math.random() * possibleValues.length));
  }
  return newShortURL;
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "J24601": "http://www.twitter.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies.username
  };
  response.render("urls_index", templateVars);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    username: request.cookies.username
  };
  response.render("urls_new", templateVars);
});

app.get("/register", (request, response) => {
  let templateVars = {
    username: request.cookies.username
  };
  response.render("register", templateVars);
});

app.post("/register", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;

  if (!userEmail) {
    response.status(400);
    response.send("Please enter a valid email")
  } else if (!userPassword) {

  }

  let userRandomId = generateRandomString();
  users[userRandomId] = {
    id: userRandomId,
    email: userEmail,
    password: userPassword
  };
  response.cookie("username", users[userRandomId].id);
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  response.cookie("user_id", request.body.username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect("/register");
});

app.get("/u/:shortURL", (request, response) => {
  if (urlDatabase[request.params.shortURL] === undefined) {
    response.redirect(404, "/urls/new");
  } else {
    let longURL = urlDatabase[request.params.shortURL];
    response.redirect(longURL);
}
});

app.post("/urls/:id", (request, response) => {
  let newLongUrl = request.body.longURL;
  let currentURL = request.params.id;

  urlDatabase[currentURL] = newLongUrl;

  response.redirect("/urls");
});


app.get("/urls/:id", (request, response) => {
  if (urlDatabase[request.params.id] === undefined) {
    response.redirect(404, "/urls/new");
  } else {
  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id],
    username: request.cookies.username
    };
  response.render("urls_show", templateVars);
  }
});

app.post("/urls/:id/delete", (request, response) => {
  let currentKey = request.params.id;
  delete urlDatabase[currentKey];
  response.redirect("/urls");
});

console.log(users);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (request, response) => {
//   response.json(urlDatabase);
// });

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });
//
// app.get("/hello", (request, response) => {
//   response.end("<html><body>Hello <b>World</b></body></html>\n");
// });
