//IGNORE THIS TOO
module.exports = {

  database: 'mongodb://raiz:llRlsllOrA@ds039674.mongolab.com:39674/ecommerce_node',
  port: 3000,
  secretKey: 'llrLsIIora',

    //declare 'facebook' object - later it can be used as middleware
    facebook: {
//globacl object procces.env - constan variable FACEBOOK_ID (value will never change)
    clientID: process.env.FACEBOOK_ID || '817967285014191',
    clientSecret: process.env.FACEBOOK_SECRET || '5e949080f3b02d3c650ab0e43a28fb22',
    profileFields: ['emails', 'displayName'],//tell FB to give us our display name and email
    callbackURL: 'http://localhost:3000/auth/facebook/callback' //when done.. redirect us to routes etc..

  }

}