/**
@param {object} user - The user being created
@param {string} user.tenant - Auth0 tenant name
@param {string} user.username - user name
@param {string} user.password - user's password
@param {string} user.email - email
@param {boolean} user.emailVerified - is e-mail verified?
@param {string} user.phoneNumber - phone number
@param {boolean} user.phoneNumberVerified - is phone number verified?
@param {object} context - Auth0 connection and other context info
@param {string} context.requestLanguage - language of the client agent
@param {object} context.connection - information about the Auth0 connection
@param {object} context.connection.id - connection id
@param {object} context.connection.name - connection name
@param {object} context.connection.tenant - connection tenant
@param {object} context.webtask - webtask context
@param {function} cb - function (error, response)
*/


module.exports = function (user, context, cb) {

  var response = {};

  request = require('request');
  
  // Add user or app metadata to the newly created user
  // response.user = {
  //   user_metadata: { foo: 'bar' },
  //   app_metadata: { vip: true, score: 7 }
  // };
  
  if(user.user_metadata && (user.user_metadata.isTeamplayUser == "true" && user.user_metadata.CaptchaResponse)){
     
    var options = {
      method: 'GET',
      url: 'https://captcha-service-dev.test.teamplay.siemens.com/api/captchavalidation/'+user.user_metadata.CaptchaResponse,
      headers: { 'Content-Type': 'application/json' }
    };
    request(options, function (error, apiResponse, body) {
  
      if (apiResponse.statusCode!==200) {
         console.log('Captcha not valid');
         return cb('Captcha not valid', apiResponse);
      }
      response.user={};
      response.user = user;
      return cb(null, response);
   });
  }
  else
  {   
    response.user = user;
    return  cb(null, response);
  }
};
