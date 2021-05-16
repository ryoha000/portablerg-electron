const { build } = require('electron-builder');

build({
  config: {
    appId: 'portablerg',
    productName: 'portablerg',
    icon: 'public/favicon.png'
  },
});
