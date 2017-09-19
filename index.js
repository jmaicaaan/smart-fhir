const express = require('express');
<<<<<<< HEAD
const app = express();
const fs = require('fs');
const mkfhir = require('fhir.js');
const bodyParser = require('body-parser');
const request = require('request');

const clientId = '907d7ba4-336a-4430-9d5c-917680f45222';
const clientSecret = 'PJuXX8xQwUS6FvJdyVoVthpQSs-unawNGKhFoEc-46tmuL9t65pZES7sFeAvFrExjUlsnPrNkhTtJKbAp0ZO6A';
const tokenURL = 'http://localhost:8080/openid-connect-server-webapp/token';
const baseUrl = 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data';
let accessToken = '';
// let client = '';

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('/public/index.html');
});

app.get('/smart-patient', (req, res) => {
  let patientSearch = () => {
    let client = mkfhir({
      baseUrl: baseUrl,
      auth: {
        bearer: accessToken
      }
    });
    client.search({
      type: 'Patient'
    }).then((data) => {
      res.send('<pre>' + JSON.stringify(data) + '</pre>');
    }).catch((err) => {
      console.log('err', err);
      res.send('<pre>' + JSON.stringify(err) + '</pre>');
    });
  };
  if (!accessToken) {
    getAccessToken((err, body) => {
      patientSearch();
    });
  } else {
    patientSearch();
  }
});

app.get('/smart-appointment', (req, res) => {
    client.search({
        type: 'Appointment'
    }).then((data) => {
        res.send('<pre>' + JSON.stringify(data) + '</pre>');
    }).catch((err) => {
        console.log('err', err);
        res.send(err);
    });
});

app.post('/smart-appointment', (req, res) => {
    client.create(req.body).then((response) => {
        console.log('response', response);
        res.send(response);
    }).catch((err) => {
        console.log('err', err);
        res.send(err);
    });
});

function getAccessToken(callback) {
  let form = {
    scope: 'profile',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  };
  request.post(tokenURL, {
    form: form
  }, (err, response) => {
    if (err) throw err;
    if (response.body) {
      let body = JSON.parse(response.body);
      accessToken = body.access_token;
      callback(null, body);
    }
  });
};

app.listen(1111, () => {
    console.log('App listening to port 1111');
});
=======
const request = require('request');
const jwt = require('jsonwebtoken');
const mkfhir = require('fhir.js');
const JSONWebKey = require('json-web-key');
const fs = require('fs');
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
      initializeFHIR(data.access_token);
      patient.loadPatient(fhir, (err, data) => {
        if (err) throw err;
        response.send('<pre>' + JSON.stringify(data) + '</pre>');
      });
  });
});

app.listen(server.port, server.domain, function () {
  console.log(`Server listening at ${ server.domain }:${ server.port }`);
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
  return {
    iss: clientId,
    sub: clientId,
    aud: config.aud,
    exp: 1522568860,
    jti: 'YWxnIjoiUlMyNTYifQ'
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
>>>>>>> 9961064... Code cleanup
