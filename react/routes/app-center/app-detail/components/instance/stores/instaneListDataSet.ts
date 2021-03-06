import React from 'react';
import { StoreProps } from '@/routes/app-center/app-detail/stores/useStore';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { DataSet } from 'choerodon-ui/pro';

export default (
  projectId: number | string,
  mainStore: StoreProps,
  appServiceId: string,
) => ({
  autoCreate: true,
  fields: [{
    type: 'string',
    name: 'version',
    valueField: 'id',
    textField: 'code',
    lookupAxiosConfig: ({ dataSet }: {
        dataSet: DataSet
      }) => (mainStore.getSelectedEnv?.id ? ({
      url: `/devops/v1/projects/${projectId}/app_service_instances/list_by_service_and_env?app_service_id=${appServiceId}&env_id=${mainStore.getSelectedEnv?.id}`,
      method: 'get',
      transformResponse: (res) => {
        function finalFunc() {
          if (newRes && newRes.length > 0) {
              dataSet?.current?.set('version', newRes && newRes?.length > 0 && newRes[0].id);
          }
        }
        let newRes = res;
        try {
          newRes = JSON.parse(res);
          finalFunc();
          return newRes;
        } catch (e) {
          finalFunc();
          return newRes;
        }
      },
    }) : () => []),
  }] as FieldProps[],
  events: {
    update: ({
      dataSet, record, name, value, oldValue,
    }: any) => console.log(dataSet, record, name, value, oldValue),
  },
});
