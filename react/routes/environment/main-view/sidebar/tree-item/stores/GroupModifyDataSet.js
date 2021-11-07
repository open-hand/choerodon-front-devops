import { axios } from '@choerodon/master';

export default ({ formatMessage, intlPrefix, id }) => {
  const nameValidator = async (value, name, record) => {
    const groupId = record.get('id');
    try {
      const res = await axios.get(`/devops/v1/projects/${id}/env_groups/check_name?name=${encodeURIComponent(value)}&group_id=${groupId}`);
      if (res.failed) {
        return '分组名重名校验失败，请稍后再试';
      } else if (!res) {
        return '分组名重复。';
      } else {
        return true;
      }
    } catch (err) {
      return '分组名重名校验失败，请稍后再试';
    }
  };

  return {
    autoCreate: true,
    paging: false,
    transport: {
      submit: ({ data: [data] }) => ({
        url: `/devops/v1/projects/${id}/env_groups`,
        method: 'put',
        data: {
          id: data.id,
          name: data.name,
        },
      }),
    },
    fields: [
      {
        name: 'name',
        maxLength: 20,
        required: true,
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.group.name` }),
        validator: nameValidator,
      },
      {
        name: 'id',
        type: 'string',
      },
    ],
  };
};
