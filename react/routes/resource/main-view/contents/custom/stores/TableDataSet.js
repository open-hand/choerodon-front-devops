/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import getTablePostData from '../../../../../../utils/getTablePostData';

export default ({
  formatMessage, intlPrefix, projectId, envId,
}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return ({
        url: `/devops/v1/projects/${projectId}/customize_resource/${envId}/page_by_env`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/customize_resource?resource_id=${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
    { name: 'k8sKind', type: 'string', label: formatMessage({ id: 'c7ncd.resource.ResourceType' }) },
    { name: 'commandErrors', type: 'string' },
    { name: 'commandStatus', type: 'string' },
    { name: 'lastUpdateDate', type: 'string', label: formatMessage({ id: 'c7ncd.resource.UpdateTime' }) },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
  ],
});
