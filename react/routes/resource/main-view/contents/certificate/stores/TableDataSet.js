import getTablePostData from '../../../../../../utils/getTablePostData';

export default ({
  formatMessage, intlPrefix, projectId, envId, format,
}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return ({
        url: `/devops/v1/projects/${projectId}/certifications/page_by_options?env_id=${envId}`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/certifications?cert_id=${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'certName', type: 'string', label: format({ id: 'CertificateName' }) },
    { name: 'error', type: 'string' },
    { name: 'commandStatus', type: 'string' },
    { name: 'domains', type: 'object', label: format({ id: 'DomainAddresses' }) },
    { name: 'validFrom', type: 'string' },
    { name: 'validUntil', type: 'string' },
  ],
  queryFields: [
    { name: 'certName', type: 'string', label: format({ id: 'CertificateName' }) },
  ],
});
