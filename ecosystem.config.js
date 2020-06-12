module.exports = {
  apps: [
    {
      name: 'live-api',
      script: './dist/app.js',
      watch: false,
      instance_var: 'INSTANCE_ID',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './error.log',
      out_file: './out.log',
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
