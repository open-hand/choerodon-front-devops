export default () => ({
  autoQuery: true,
  paging: false,
  transport: {
    read: {
      url: 'market/v1/market/application/market_application_with_sourcecode',
      method: 'get',
    },
  },
});
