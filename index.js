const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('/public/index.html');
});

app.listen(1111, () => {
    console.log('App listening to port 1111');
});