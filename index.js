const express = require("express");
const request = require("request");
const jwt = require("jsonwebtoken");
const mkfhir = require("fhir.js");
const moment = require("moment");
const JSONWebKey = require("json-web-key");
const fs = require("fs");

let app = express();

let server = {
  port: 3000,
  domain: "localhost"
};

let clientSecret = "AMJoV_D0jiJeptbBKhxMJCv5tab6CzisnFFU7aeiBZALNiBjPGKu24M07x9fxmCE4SGdlu8vNYN9cPhxDf_K0ko";
let clientId = "8adbf510-2181-4ae3-afd6-277935b6b3cd";

let claims = {
  iss: clientId,
  sub: clientId,
  exp: moment().add(5, "minutes").unix(),
  aud: "https://sb-auth.smarthealthit.orgtoken",
  jti: "id123456"
};

let privateKey = fs.readFileSync("./src/keygen/id_rsa");

let publicKey = fs.readFileSync("./src/keygen/id_rsa.pem");

let JWKey = JSONWebKey.fromPEM(publicKey);

let token = jwt.sign(claims, privateKey, {algorithm: "RS256"});

let form = {
  grant_type: "client_credentials",
  scope: "online_access profile",
  client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  client_assertion: token
};

app.use(express.static("node_modules"));

app.get("/", function (request, response) {
  response.send(`Server listening at ${ server.domain }:${ server.port }`);
});

app.listen(server.port, server.domain, function () {
  console.log(`Server listening at ${ server.domain }:${ server.port }`);
});

request.post("https://sb-auth.smarthealthit.org/token", {form:form}, function (error, response, body) {

  if (error) {
    console.log("Error:", error);
    return;
  }

  let accessToken = JSON.parse(body).access_token;

  console.log(body);

  let client = mkfhir({
    baseUrl: "https://sb-fhir-stu3.smarthealthit.org/smartstu3/data",
    auth: {
      bearer: accessToken
    }
  });

  app.get("/smart-patient", (request, response) => {
    client.search({
      type: "Patient"
    }).then((data) => {
      response.status(200).send("<pre>" + JSON.stringify(data) + "</pre>");
    }).catch((error) => {
      response.status(500).send(error);
    });
  });

  app.get("/smart-appointment", (request, response) => {
    client.search({
      type: "Appointment"
    }).then((data) => {
      response.status(200).send("<pre>" + JSON.stringify(data) + "</pre>");
    }).catch((error) => {
      response.status(500).send(error);
    });
  });

});
