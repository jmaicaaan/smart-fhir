const express = require("express");
const request = require("request");
const jwt = require("jsonwebtoken");
const fs = require("fs");

let app = express();

let server = {
  port: 3000,
  domain: "localhost"
};

let clientSecret = "AMJoV_D0jiJeptbBKhxMJCv5tab6CzisnFFU7aeiBZALNiBjPGKu24M07x9fxmCE4SGdlu8vNYN9cPhxDf_K0ko";
let clientId = "8adbf510-2181-4ae3-afd6-277935b6b3cd";

let form = {
  grant_type: "client_credentials",
  scope: "online_access profile",
  client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  client_id: clientId,
  client_secret: clientSecret
}

// let claims = {
//   iss: "http://localhost:3000",
//   sub: clientId,
//   exp: 1422568860,
//   aud: "https://sb-auth.smarthealthit.org/token"
// };
//
// let key = fs.readFileSync('./src/keygen/id_rsa');
//
// let token = jwt.sign(claims, key, {algorithm: "RS256"});
//
// let form = {
//   grant_type: "client_credentials",
//   scope: "online_access profile",
//   client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
//   client_id: "8adbf510-2181-4ae3-afd6-277935b6b3cd",
//   client_secret: "AMJoV_D0jiJeptbBKhxMJCv5tab6CzisnFFU7aeiBZALNiBjPGKu24M07x9fxmCE4SGdlu8vNYN9cPhxDf_K0ko"
// };

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
