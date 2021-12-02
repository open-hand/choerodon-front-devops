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

      return {
        url: `/devops/v1/projects/${projectId}/pvcs/page_by_options?env_id=${envId}`,
        method: 'post',
        data: postData,
      };
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/pvcs/${data.id}?env_id=${envId}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: 'c7ncd.resource.pvcName' }) },
    { name: 'status', type: 'string', label: formatMessage({ id: 'boot.states' }) },
    { name: 'pvName', type: 'string', label: formatMessage({ id: 'c7ncd.resource.BoundPV' }) },
    { name: 'accessModes', type: 'string', label: formatMessage({ id: 'c7ncd.resource.AccessMode' }) },
    { name: 'requestResource', type: 'string', label: formatMessage({ id: 'c7ncd.resource.Total' }) },
    { name: 'type', type: 'string', label: formatMessage({ id: 'c7ncd.resource.PVType' }) },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: 'c7ncd.resource.pvcName' }) },
    { name: 'accessModes', type: 'string', label: formatMessage({ id: `${intlPrefix}.pvc.accessModes` }) },
  ],
});
