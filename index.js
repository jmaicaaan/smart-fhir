const express = require('express');
const app = express();
const fs = require('fs');
const mkfhir = require('fhir.js');
const bodyParser = require('body-parser');
const request = require('request');

const accessToken = 'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxOTk0MmY0Zi1mYTQ5LTQzNzMtODAzYy0wOGU4MjM4ODEzYTciLCJpc3MiOiJodHRwczpcL1wvc2ItYXV0aC5zbWFydGhlYWx0aGl0Lm9yZyIsImlhdCI6MTUwNTM4MTc4MiwianRpIjoiYTY3NjBiNjUtNWY2MS00NmM3LTlkMjItYWE3MGU1N2YwZjM2In0.SohFUPbAbzmA8nHkbSVhOCJuNpGSykxmB3_7F7BQI8L-yiGy-V20i6J8kFlHej8WUJZtU7PGe7MaO1rAI9HmIsJ4hf89aUksKPu1fdu5C3Hr9B1ztaZ_mfGTj4DwbecoPUmwE4U_rV1YLH1x7X5Uh5MSUm8uP73QoLw6i0TGfsZd5TxPhg4-lAMU_3V0NYWAcgO3Q6Q-UwgGabCJbkfHlmUSYpAtx-P2hMZ4KEhorSEb0nbV2TUQPJv5wRhjNo1-qV8gS1IL36nyo34q-DJ56lV9AwtEf1rB8bRSHlUFZJJqnokS33DuYCcCVaO9H1CxyxxPocfXAM9OHiubGsPDdg';
const clientId = '97d6424b-fcb9-4a50-bba1-914d00f842aa';
const clientSecret = 'AI-TgehQKPfyXMiZ0WMpqAnClzsZ0VLwFfD85BvueAicDncx9vQcLOGLNaR4zHhnfZ0I9Dfo2z54mh0ziDSYBJw';
const tokenURL = 'http://localhost:8080/openid-connect-server-webapp/token';
const client = mkfhir({
    baseUrl: 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data',
    auth: {
        bearer: accessToken
    }
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('/public/index.html');
});

app.get('/smart-patient', (req, res) => {
    client.search({
        type: 'Patient'
    }).then((data) => {
        res.send('<pre>' + JSON.stringify(data) + '</pre>');
    }).catch((err) => {
        console.log('err', err);
    });
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

app.get('/token', (req, res) => {
  let form = {
    scope: 'profile',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    grant_type: 'client_credentials',
    client_id: clientId
  };
  request.post(tokenURL, {
    form: form
  }, (err, response) => {
    if (err) throw err;
    console.log('response', response);
  });

});

app.listen(1111, () => {
    console.log('App listening to port 1111');
});