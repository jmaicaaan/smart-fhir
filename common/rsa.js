const fs = require('fs');

/**
 * returns the RSA public pem key
 */
function getPublicKey() {
    return fs.readFileSync(__dirname + '/keygen/id_rsa.pem');
}

/**
 * returns the RSA private key
 */
function getPrivateKey() {
    return fs.readFileSync(__dirname + '/keygen/id_rsa');
}

module.exports = {
    getPublicKey: getPublicKey,
    getPrivateKey: getPrivateKey
};