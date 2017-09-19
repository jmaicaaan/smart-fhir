const express = require('express');
const mkfhir = require('fhir.js');
const config = require('./config.json');
const patient = require('./resource/patient');
const accessToken = require('./common/accessToken');
const jwk = require('./common/jwk');

let app = express();
let server = {
  port: 3000,
  domain: 'localhost'
};
let fhir;


app.get('/', function (request, response) {
  jwk.generate();
  accessToken.requestToken((err, data) => {
    if (err) throw err;
    initializeFHIR(data.access_token);
    patient.loadPatient(fhir, (err, data) => {
      if (err) throw err;
      response.send('<pre>' + JSON.stringify(data) + '</pre>');
    });
  });
});

app.listen(server.port, server.domain, function () {
  console.log(`Server listening at http://${ server.domain }:${ server.port }`);
});


/**
 * Initialize the FHIR object with the given access token
 * @param {*} accessToken 
 */
function initializeFHIR(accessToken) {
  if (!accessToken) {
    console.log('no access token');
    return;
  }
  fhir = mkfhir({
    baseUrl: config.baseUrl,
    auth: {
      bearer: accessToken
    }
  });
}