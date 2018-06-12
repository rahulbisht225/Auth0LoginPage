function (user, context, callback) {
    if (context.request.geoip) {
      context.idToken['https://teamplay.siemens.com/country'] = context.request.geoip.country_name;
      context.idToken['https://teamplay.siemens.com/city'] = context.request.geoip.city;
      context.idToken['https://teamplay.siemens.com/timezone'] = context.request.geoip.time_zone;
    }
    
    callback(null, user, context);
  }