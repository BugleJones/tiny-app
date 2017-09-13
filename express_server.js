"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser() );

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

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase
  };
  response.render("urls_index", templateVars);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.post("/login", (request, response) => {
  response.cookie("username", request.body.username);
  response.redirect("/urls");
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
    longURL: urlDatabase[request.params.id]
    };
  response.render("urls_show", templateVars);
  }
});

app.post("/urls/:id/delete", (request, response) => {
  //Find the urls
  let currentKey = request.params.id;
  // Remove it
  delete urlDatabase[currentKey];
  //Redirect
  response.redirect("/urls");
});

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
