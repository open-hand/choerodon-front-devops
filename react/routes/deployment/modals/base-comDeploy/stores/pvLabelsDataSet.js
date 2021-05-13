import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import { mapping } from './baseDeployDataSet';

/**
 * key变化 设置value值
 * @param store
 * @param value
 * @param record
 */
function setValueWhenMatchKey(
  store,
  value,
  record,
) {
  const list = store.getPvLabelsList;
  const item = list.find((i) => i.key === value);
  if (item) {
    record.set('value', item.value);
  }
}

export default (projectId, BaseDeployDataSet, BaseComDeployStore) => ({
  autoCreate: true,
  fields: [{
    name: 'key',
    type: 'string',
    label: '键',
    textField: 'key',
    valueField: 'key',
    dynamicProps: {
      lookupAxiosConfig: () => (BaseDeployDataSet.current.get(mapping.env.name) ? ({
        url: BaseComDeployApis.getPvLabesUrl(
          projectId,
          BaseComDeployStore.getEnvList
            .find((i) => i.id === BaseDeployDataSet.current.get(mapping.env.name)).clusterId,
        ),
        method: 'get',
        transformResponse: (res) => {
          let newRes = res;
          try {
            newRes = JSON.parse(res);
            BaseComDeployStore.setPvLabelsList(newRes);
            return newRes;
          } catch (e) {
            BaseComDeployStore.setPvLabelsList(newRes);
            return newRes;
          }
        },
      }) : undefined),
    },
  }, {
    name: 'value',
    type: 'string',
    label: '值',
  }],
  events: {
    update: async ({
      record, name, value,
    }) => {
      switch (name) {
        case 'key': {
          setValueWhenMatchKey(
            BaseComDeployStore,
            value,
            record,
          );
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});
