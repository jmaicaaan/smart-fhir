const express = require('express');
const request = require('request');
const jwt = require('jsonwebtoken');
const mkfhir = require('fhir.js');
const JSONWebKey = require('json-web-key');
const fs = require('fs');
const moment = require('moment');
const config = require('./config.json');
const patient = require('./resource/patient');

let app = express();
let server = {
  port: 3000,
  domain: 'localhost'
};
let clientId = config.clientId;
let fhir;


app.get('/', function (request, response) {
  generateJWK();
  requestAccessToken((err, data) => {
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

/**
 * Returns the created JWT Claim object. Used by signJWTClaim(claim)
 */
function createJWTClaimRequest() {
  let exp = moment().add(5, 'minutes').unix();
  let nonceString = 'YWxnIjoiUlMyNTYifQ';
  return {
    iss: clientId,
    sub: clientId,
    aud: config.aud,
    exp: exp,
    jti: nonceString
  };
}

/**
 * Create a token request form to be used when doing POST request for access token. Returns the token form
 * 
 * @param {*} clientAssertionToken - a signed JWT claim token
 * 
 */

function createTokenRequestForm(clientAssertionToken) {
  if (!clientAssertionToken) {
    console.log('no client assertion token'); 
    return;
  };
  let grantType = config.tokenForm.grantType;
  let scope = config.tokenForm.scope;
  let clientAssertionType = config.tokenForm.clientAssertionType;
  return {
    grant_type: grantType,
    scope: scope,
    client_assertion_type: clientAssertionType,
    client_assertion: clientAssertionToken
  };
}

/**
 * Create a request for access token to the openId server
 */
function requestAccessToken(callback) {
  let tokenURL = config.tokenURL;
  let JWTClaimRequest = createJWTClaimRequest();
  let clientAssertionToken = signJWTClaim(JWTClaimRequest);
  let form = createTokenRequestForm(clientAssertionToken);

  request.post(tokenURL, { 
    form: form
  }, (err, response, body) => {
    if (err) throw err;
    if (response.body) {
      try {
        let body = JSON.parse(response.body);
        let accessToken = body.access_token;
        callback(err, body);
      } catch (error) {
        console.log('parsing error');
        callback(error, null);
      }
    }
  });
}

/**
 * Used in openId - public key set 
 */
function generateJWK() {
  let publicKey = fs.readFileSync(__dirname + '/src/keygen/id_rsa.pem');
  let publicKeySet = JSONWebKey.fromPEM(publicKey);
  console.log('Public key set ->', publicKeySet.toJSON());
}

function getRSAPrivateKey() {
  return fs.readFileSync(__dirname + '/src/keygen/id_rsa');
}

/**
 * Return the signed token as JWT which will be use for requesting access token to the openId server
 * @param {*} claim 
 */
function signJWTClaim(claim) {
  if (!claim) {
    console.log('no jwt claim'); 
    return;
  }
  let privateKey = getRSAPrivateKey();
  let alg = {
    algorithm: 'RS256'
  };
  return jwt.sign(claim, privateKey, alg);
}