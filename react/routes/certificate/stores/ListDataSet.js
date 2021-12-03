/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import { axios } from '@choerodon/master';
import getTablePostData from '../../../utils/getTablePostData';

export default ((intlPrefix, formatMessage, projectId) => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return ({
        url: `/devops/v1/projects/${projectId}/certs/page_cert`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/certs/${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: 'c7ncd.CertManagement.CertificateName' }) },
    { name: 'domain', type: 'string', label: formatMessage({ id: 'c7ncd.CertManagement.DomainNameAddress' }) },
    { name: 'keyValue', type: 'string' },
    { name: 'certValue', type: 'string' },
    {
      name: 'skipCheckProjectPermission', type: 'boolean', defaultValue: true, label: formatMessage({ id: `${intlPrefix}.share` }),
    },
    { name: 'projects', type: 'object' },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: 'c7ncd.CertManagement.CertificateName' }) },
  ],
}));
