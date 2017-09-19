const express = require('express');
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