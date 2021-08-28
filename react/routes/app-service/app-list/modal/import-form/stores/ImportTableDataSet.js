import forEach from 'lodash/forEach';
import {
  appServiceApiConfig,
} from '@/api';

export default ({ intlPrefix, formatMessage, projectId }) => ({
  autoQuery: false,
  pageSize: 20,
  dataToJson: false,
  transport: {
    read: ({ data }) => {
      // eslint-disable-next-line camelcase
      const { share, search_project_id, param } = data;
      let url = '';
      forEach({ search_project_id, param }, (value, key) => {
        value && (url = `${url}&${key}=${value}`);
      });
      return (appServiceApiConfig.pageByMode(share, url));
    },
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.name` }) },
    { name: 'code', type: 'string', label: formatMessage({ id: `${intlPrefix}.code` }) },
    { name: 'type', type: 'string', label: formatMessage({ id: `${intlPrefix}.type` }) },
    { name: 'projectName', type: 'string', label: formatMessage({ id: `${intlPrefix}.project` }) },
    { name: 'share', type: 'boolean', label: formatMessage({ id: `${intlPrefix}.source` }) },
  ],
});
