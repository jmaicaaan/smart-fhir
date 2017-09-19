const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config.json');
const rsa = require('./rsa');


/**
 * Returns the created JWT Claim object. Used by signJWTClaim(claim)
 */
function createClaim() {
    let clientId = config.clientId;
    let exp = moment().add(5, 'minutes').unix();
    let nonceString = 'YWxnIjoiUlMyNTYifQ'; // any value - used as an identifier
    return {
      iss: clientId,
      sub: clientId,
      aud: config.aud,
      exp: exp,
      jti: nonceString
    };
}

/**
 * Return the signed token as JWT which will be use for requesting access token to the openId server
 */

function signedClaim() {
    let claim = createClaim();
    if (!claim) {
        console.log('no jwt claim'); 
        return;
    }
    let privateKey = rsa.getPrivateKey();
    let alg = {
      algorithm: 'RS256'
    };
    return jwt.sign(claim, privateKey, alg);
}

module.exports = {
    signedClaim: signedClaim
};