module.exports = {
  apps: [
    {
      name: 'APP',    
      cwd: '/var/www/dev/uls-app/app',  
      script: 'yarn',
      args: 'start:production',
      env: {
        PORT: 3000,
      },
    },
    {
      name: 'API',    
      cwd: '/var/www/dev/uls-app/api',  
      script: 'yarn',
      args: 'start:production',
      env: {
        PORT: 5000,
      },
    },
  ],
};
