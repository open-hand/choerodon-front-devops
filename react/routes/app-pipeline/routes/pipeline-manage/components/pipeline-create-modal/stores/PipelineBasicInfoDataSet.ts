import { Record as DsRecord } from '@/interface';

const PipelineBasicInfoDataSet = ({
  appServiceDs,
  branchDs,
}:any):any => {
  // 更新branch的值, branch依据appService的变化而变化
  // reset true: 清空值
  function handleUpdateBranch(record:DsRecord, value:Record<string, any>) {
    const currentBranch = record.get('branch');
    if (currentBranch) record.set('branch', null);
    branchDs.setQueryParameter('appServiceId', value?.appServiceId);
    branchDs.query();
  }

  // 处理update事件
  function handleUpdate({ dataSet, value, name }:any) {
    const record = dataSet.current;
    if (name === 'appService' && value) {
      handleUpdateBranch(record, value);
    }
  }

  return {
    autoCreate: true,
    events: {
      update: handleUpdate,
    },
    fields: [
      {
        label: '流水线名称',
        name: 'pipelineName',
        type: 'string',
        required: true,
        maxLength: 30,
      },
      {
        label: '关联应用服务',
        name: 'appService',
        textField: 'appServiceName',
        valueField: 'appServiceId',
        type: 'object',
        required: true,
        options: appServiceDs,
      },
      {
        label: '关联分支',
        name: 'branch',
        type: 'object',
        maxLength: 5,
        required: true,
        textField: 'branchName',
        valueField: 'branchName',
        options: branchDs,
      },
    ],
  };
};

export default PipelineBasicInfoDataSet;
