const JSONWebKey = require('json-web-key');
const rsa = require('./rsa');

/**
 * Used in openId - public key set 
 */
function generate() {
    let publicKey = rsa.getPublicKey();
    let publicKeySet = JSONWebKey.fromPEM(publicKey);
    console.log('Public key set ->', publicKeySet.toJSON());
}

module.exports = {
    generate: generate
};