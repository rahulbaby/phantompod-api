const PORT = process.env.PORT || 4000;

module.exports = {
  app: {
    name: 'phantompod-api',
    port: PORT,
    baseUrl: `https://app.phantompod.co/api`,
    webUrl: `https://app.phantompod.co`,
  },
  api: {
    prefix: '/api',
    versions: [1],
  },
  lang: 'en',
  authToken: {
    superSecret: 'ipa-odot',
    expiresIn: 86400,
    jwtSecret: 'pantompods',
  },
  db: {
    url: 'mongodb://localhost:27017/phantompod',
  },
  ssl: {
    key: 'key path goes here',
    cert: 'cert path goes here',
  },
  google: {
    OAuth: {
      GOOGLE_CLIENT_ID: '623352957166-hg40u5m296b2sfu7c1nlcq60pl6nlkdm.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'RSMp9rWwzqjaQzKRi2EM93YB',
    },
  },
  stripe: {
    apiVersion: '2020-03-02',
    SECRET_KEY:
      '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',
    PUBLIC_KEY:
      'pk_live_51GvxMtDZgeAkgxKXMx1RDDnnchtaxGX0ErwjatFqxa4N2hiBZQuHrAvcsSTOqaWfeCIq7dcKpbnbZCuXeOpAscHr00ppexAkmY',
    PRODUCT_PRICE_ID: 'price_1H9X8qDZgeAkgxKXDgYl2xgQ', //current active price
    PRODUCT_NAME: 'TEST PLAN',
    PRODUCT_PERIOD: 30, //days
  },
  trialSubscription: {
    TRIAL_PERIOD: 2, //days
    POD_COUNT: 2, //maximum pods user can attend while he is in trial
  },
};
