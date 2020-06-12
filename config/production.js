const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;
module.exports = {
  app: {
    name: 'phantompod-api',
    port: PORT,
    baseUrl: BASE_URL,
  },
  api: {
    prefix: '/api',
    versions: [1],
  },
  lang: 'en',
  authToken: {
    superSecret: 'ipa-odot',
    expiresIn: 86400,
  },
  db: {
    url: 'mongodb://localhost:27017/todo',
  },
  itemsPerPage: {
    default: 10,
  },
};
