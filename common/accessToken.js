const request = require('request');
const config = require('../config.json');
const jwt = require('./jwt');

/**
 * 
 * Create a request for access token to the openId server
 *
 * @param {*} callback 
 */
function requestToken(callback) {
    let tokenUrl = config.tokenUrl;
    let signedClaim = jwt.signedClaim();
    let form = createTokenRequestForm(signedClaim);
    
    request.post(tokenUrl, { 
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

module.exports = {
    requestToken: requestToken
};