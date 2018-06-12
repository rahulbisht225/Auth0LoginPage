/**
@param {object} user - The user being created
@param {string} user.id - user id
@param {string} user.tenant - Auth0 tenant name
@param {string} user.username - user name
@param {string} user.email - email
@param {boolean} user.emailVerified - is e-mail verified?
@param {string} user.phoneNumber - phone number
@param {boolean} user.phoneNumberVerified - is phone number verified?
@param {object} user.user_metadata - user metadata
@param {object} user.app_metadata - application metadata
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
  if(user.user_metadata && user.user_metadata.isTeamplayUser == "true"){
    request = require('request@2.87.0');

    var uerReggUrl ='https://users-service-dev.test.teamplay.siemens.com/api/users?privacyPolicyId='+parseInt(user.user_metadata.privacyPolicyId);
     var bodyContent=JSON.stringify({ 
      "FirstName":user.user_metadata.given_name,
     "LastName":user.user_metadata.family_name,
     "UserName":user.email,
     "Country":user.user_metadata.Country,
     "Password":"Pwd@1234",
     "LocaleId":1,
     "CaptchaResponse":"",
     "Auth0UserId": "auth0|"+user.id
    });
   request({ 
    method: 'POST', 
    url: uerReggUrl, 
    headers: { 
      'Content-Type': 'application/json; charset=utf-8'
    }, 
    body:bodyContent
   }, 
    function(error, response, body) { 
      console.log("Response "+response.statusCode);
      if(response.statusCode===200)
      {
         console.log('User Registration success');
      }
      cb(error, response) 
    });
  }
  else{
    response.user ={};
    console.log("no metadata");
    response.user = user;
    cb(null, response);
  }
};
