const config = {
  server: 'http://api.staging.saas.test.com',
  fileServer: 'http://minio.staging.saas.test.com',
  projectType: 'choerodon',
  buildType: 'single',
  master: './node_modules/@choerodon/master/lib/master.js',
  theme: {
    'primary-color': '#3f51b5',
    'icon-font-size-base': '16px',
  },
  dashboard: {},
  modules: [
    '.',
  ],
  resourcesLevel: ['site', 'organization', 'project', 'user'],
};

module.exports = config;
