const express = require("express");
const request = require("request");
const jwt = require("jsonwebtoken");
const fs = require("fs");

let app = express();

let server = {
  port: 3000,
  domain: "localhost"
};

let user = {
  iss: "http://localhost:3000",
  sub: "5b483eab-fdd6-46bb-aae4-f053fed5d3c4",
  exp: 1422568860,
  aud: "https://sb-auth.smarthealthit.org/token",
  jti: "c0632b33-b83c-4302-89ad-4faf1a1ae0e0",
  token_endpoint_auth_method: "private_key_jwt"
};

let key = fs.readFileSync('./src/keygen/id_rsa');

let token = jwt.sign(user, key, { algorithm: "RS256" });

// let secret = new Buffer("secret").toString('base64')
//
// let token = jwt.sign(user, secret);

let form = {
  grant_type: "client_credentials",
  scope: "launch system/*.read profile",
  client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  client_assertion: token,
  token_endpoint_auth_method: "private_key_jwt",
  "jwks": {
    "keys": [
      {
        "kty": "RSA",
        "e": "AQAB",
        "use": "sig",
        "kid": "secret",
        "alg": "RS256",
        "n": "hP8au9TzqnaLm1cav2FH49xsq-AF6oe4JTKP4Yevh3O39V4btv51lbkysJ-GYmoKqWEqM_fhnTmOhyqbL2z_zY4tfhkHJ6_pAfJ7jlSH3OiAdavZTnuQBd5tMyoQvCugZ7iyJm6T-MqBjZIJnSxBl_8UjIawAZGX9jx6owHwd1IjtSQCBVodA_OA9cO9aD5I7B80pMQvr4MfJ3Ud2N59DTS7o_YHzuPz1Ugr0XKiqqPL-NcepjjbL13AIp6HpKO8vpUmKTWWW2OuKT7S0TwM87lTQ3WX9C9Py2NPYwl0JDgpyRRI7yJ7ucbJXSWIs35gvw4k7M75VkO8_5qlMINvIQ"
      }
    ]
  }
};

app.use(express.static("node_modules"));

app.get('/', function (request, response) {
  response.send(`Server listening at ${ server.domain }:${ server.port }`);
});

app.listen(server.port, server.domain, function () {
  console.log(`Server listening at ${ server.domain }:${ server.port }`);
});

request.post("https://sb-auth.smarthealthit.org/token", {form:form}, function (error, response, body) {
  if (error) console.log(error);
  console.log(body);
});
