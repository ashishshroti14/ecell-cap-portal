const CracoLessPlugin = require('craco-less');

module.exports = {
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              modifyVars: { '@primary-color': '#223BE1' },
              javascriptEnabled: true,
            },
          },
        },
      },
    ],
  };