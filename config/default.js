const PORT = process.env.PORT || 4000;

module.exports = {
  app: {
    name: 'phantompod-api',
    port: PORT,
    baseUrl: `http://localhost:${PORT}`,
    webUrl: `http://localhost:3000`,
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
      GOOGLE_CLIENT_ID: '642915743730-334e9pv6ugserg7v16k1q64tflugf6fq.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'cbYGeefT1f2I01BlH1BUYLZQ',
    },
  },
  stripe: {
    SECRET_KEY: 'sk_test_3hSrGVAUh0LB0zm1C4Yh5cE4',
    PUBLIC_KEY: 'pk_test_F1U8ZiSPK9gAcjttJZTUiwrZ',
    PRODUCT_PRICE_ID: 'price_1GyWkZBrW3Gw5uscVoPjmlXS', //current active price
    PRODUCT_NAME: 'MONTHLY PLAN',
    apiVersion: '2020-03-02',
  },
};
