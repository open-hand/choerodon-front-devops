export default (():any => ({
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: {
      method: 'get',
    },
  },
}));
