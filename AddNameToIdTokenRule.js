function (user, context, callback) {
    if (user.user_metadata) {
      context.idToken.family_name = user.user_metadata.family_name;
      context.idToken.given_name = user.user_metadata.given_name;
    }
    callback(null, user, context);
}