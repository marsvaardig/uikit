const browserSync = require('browser-sync').create();
const { exec } = require('child_process');

// Start SASS watcher
const sassProcess = exec('sass assets/scss/style.scss:public_html/css/style.css --watch');

// Start BrowserSync
browserSync.init({
  proxy: "https://local.uikit.nl",
  open: true,
  notify: false,
  port: "6277",
  https: {
    key: '/Users/robinpoort/certs/localhost/localhost.key',
    cert: '/Users/robinpoort/certs/localhost/localhost.crt',
  },
  files: [
    'public_html/css/style.css',
    'public_html/**/*.html',
    'public_html/**/*.js'
  ]
});

sassProcess.stdout.on('data', (data) => console.log(data));
sassProcess.stderr.on('data', (data) => console.error(data));
