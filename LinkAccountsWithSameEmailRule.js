function (user, context, callback) {
    var request = require('request@2.56.0');
  
    console.log("user="+JSON.stringify(user));
    console.log("context="+JSON.stringify(context));
  
    // Check if email is verified, we shouldn't automatically
    // merge accounts if this is not the case.
  //   if (!user.email || !user.email_verified) {
  //     return callback(null, user, context);
  //   }
    var userApiUrl = auth0.baseUrl + '/users';
    var userSearchApiUrl = auth0.baseUrl + '/users-by-email';
  
    request({
     url: userSearchApiUrl,
     headers: {
       Authorization: 'Bearer ' + auth0.accessToken
     },
     qs: {
       email: user.email
     }
    },
    function(err, response, body) {
      console.log("err="+JSON.stringify(err));
      console.log("response="+JSON.stringify(response));
      console.log("body="+JSON.stringify(body));
      if (err) return callback(err);
      if (response.statusCode !== 200) return callback(new Error(body));
  
      var data = JSON.parse(body);
      // Ignore non-verified users and current user, if present
      data = data.filter(function(u) {
        var provider = u.identities[0].provider;
        return (provider !== 'auth0' || u.email_verified) && (u.user_id !== user.user_id);
      });
  
      console.log("data="+JSON.stringify(data));
      console.log("identity count ="+user.identities.length);
      if (user.identities.length === 0) {
          console.log("connection ="+user.identities[0].connection);
      }
      var link = function() {
            if (data.length > 1) {
            return callback(new Error('[!] Rule: Multiple user profiles already exist - cannot select base profile to link with'));
        }
        if (data.length === 0) {
            console.log('[-] Skipping link rule');
            return callback(null, user, context);
        }
    
        var originalUser = data[0];
        var provider = user.identities[0].provider;
        var providerUserId = user.identities[0].user_id;
    
        user.app_metadata = user.app_metadata || {};
        user.user_metadata = user.user_metadata || {};
        auth0.users.updateAppMetadata(originalUser.user_id, user.app_metadata)
        .then(auth0.users.updateUserMetadata(originalUser.user_id, user.user_metadata))
        .then(function(){
            request.post({
            url: userApiUrl + '/' + originalUser.user_id + '/identities',
            headers: {
                Authorization: 'Bearer ' + auth0.accessToken
            },
            json: { provider: provider, user_id: providerUserId }
            }, function(err, response, body) {
                if (response && response.statusCode >= 400) {
                return callback(new Error('Error linking account: ' + response.statusMessage));
                }
                context.primaryUser = originalUser.user_id;
                callback(null, user, context);
            });
        })
        .catch(function(err){
            callback(err);
        });
      };
      if (user.identities.length !== 0 && user.identities[0].connection === "CESREF") {
        //This is a new CES user
        console.log("This is a new CES user");
        var auth0Users = data.filter(function(u) {
          var provider = u.identities[0].provider;
          return provider === 'auth0';
        });
        console.log("auth0Users="+JSON.stringify(auth0Users));
        if (auth0Users.length === 0) {
          //This new CES user is not yet linked to an auth0 user
          console.log("This new CES user is not yet linked to an auth0 user");
          var userCreateApiUrl = auth0.baseUrl + '/users';
  
          var r = { 
              method: 'POST', 
              url: userCreateApiUrl, 
              headers: { 
                  Authorization: 'Bearer ' + auth0.accessToken
              }, 
              json: {
                  "user_id": "",
                  "connection": "Username-Password-Authentication",
                  "email": user.email,
                  "password": "Secret!"+(Math.floor(Math.random() * Math.floor(1000000))),
                  "user_metadata": {},
                  "email_verified": true,
                  "verify_email": false,
                  "app_metadata": {}
              }
          };
          console.log("r="+JSON.stringify(r));
          request.post(r, 
              function(err, response, body) {
                  console.log("err="+JSON.stringify(err));
                  console.log("response="+JSON.stringify(response));
                  console.log("body="+JSON.stringify(body));
                  link();
              });
        }
        else {
            return link();
        }
      }
      else {
          return link();}
    });
  }