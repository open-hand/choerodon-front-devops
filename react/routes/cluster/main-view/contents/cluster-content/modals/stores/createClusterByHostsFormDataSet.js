/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import { omit, map, forEach } from 'lodash';

function calculateType(typeArr) {
  let num = 0;
  forEach(typeArr, (key) => {
    switch (key) {
      case 'master':
        num += 4;
        break;
      case 'etcd':
        num += 2;
        break;
      case 'worker':
        num += 1;
        break;
      default:
        break;
    }
  });
  return num;
}

let clusterName;
export default ({
  projectId, formatMessage, intlPrefix, modal, isEdit, afterOk, mainStore, clusterId, nodesDs,
}) => {
  async function checkClusterName(value) {
    let messageName = true;
    if (value === clusterName && isEdit) {
      return messageName;
    }
    await mainStore.checkClusterName({
      projectId,
      clusterName: window.encodeURIComponent(value),
    }).then((res) => {
      if ((res && res.failed) || !res) {
        messageName = formatMessage({ id: 'checkNameExist' });
      }
    }).catch((e) => {
      messageName = `${formatMessage({ id: `${intlPrefix}.check.error` })}`;
    });
    return messageName;
  }

  async function checkClusterCode(value) {
    let messageCode = true;
    if (isEdit) return messageCode;
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && !pa.test(value)) {
      messageCode = `编码${formatMessage({ id: `${intlPrefix}.check.failed` })}`;
    } else {
      await mainStore.checkClusterCode({
        projectId,
        clusterCode: value,
      }).then((res) => {
        if ((res && res.failed) || !res) {
          messageCode = formatMessage({ id: 'checkCodeExist' });
        }
      }).catch((e) => {
        messageCode = formatMessage({ id: 'checkCodeFailed' });
      });
    }
    return messageCode;
  }

  return {
    autoCreate: true,
    autoQuery: false,
    selection: false,
    paging: false,
    dataKey: null,
    fields: [
      {
        name: 'name',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.name` }),
        required: true,
        maxLength: 30,
        validator: checkClusterName,
      },
      {
        name: 'code',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.code` }),
        required: true,
        maxLength: 30,
        validator: checkClusterCode,
      },
      {
        maxLength: 100,
        name: 'description',
        type: 'string',
        rows: 3,
        label: formatMessage({ id: `${intlPrefix}.dec` }),
      },
    ],
    transport: {
      read: clusterId ? {
        url: `devops/v1/projects/${projectId}/clusters/${clusterId}`,
        method: 'get',
      } : undefined,
      create: ({ data: [data] }) => ({
        url: `/devops/v1/projects/${projectId}/clusters`,
        method: 'post',
        data: JSON.stringify(data),
        transformRequest: (value) => {
          const source = omit(JSON.parse(value), ['__id', '__status']);
          if (source?.devopsClusterNodeVOList) {
            source.devopsClusterNodeVOList = map(source?.devopsClusterNodeVOList, (item) => {
              const tempItem = omit(item, ['__id', '__status', 'hasError']);
              tempItem.type = calculateType(tempItem?.type);
              return tempItem;
            });
          }
          return JSON.stringify(source);
        },
        transformResponse: ((res) => {
          try {
            const result = JSON.parse(res);
            return result;
          } catch (e) {
            // if (handlePromptError(res)) {
            //   mainStore.setResponseData(res);
            //   // afterOk();
            //   // modal.close();
            // }
            return res;
          }
        }),
      }),
      update: ({ data: [data] }) => ({
        url: `/devops/v1/projects/${projectId}/clusters/${data.id}?`,
        method: 'put',
        data,
      }),
    },
    events: {
      load: ({ dataSet }) => {
        clusterName = dataSet.current.get('name');
      },
    },
    children: {
      devopsClusterNodeVOList: nodesDs,
    },
  };
};
