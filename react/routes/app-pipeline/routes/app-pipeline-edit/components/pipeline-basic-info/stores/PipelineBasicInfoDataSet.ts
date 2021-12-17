import { Record as DsRecord } from '@/interface';

const PipelineBasicInfoDataSet = ({
  formatPipelineEdit,
  appServiceDs,
  branchDs,
  setData,
}:any):any => {
  // 更新branch的值, branch依据appService的变化而变化
  // reset true: 清空值
  function handleUpdateBranch(record:DsRecord, value:Record<string, any>, reset?:boolean) {
    const currentBranch = record.get('branch');
    if (currentBranch && reset) record.set('branch', null);
    branchDs.setQueryParameter('appServiceId', value?.appServiceId);
    branchDs.query();
  }

  // 处理update事件
  function handleUpdate({ dataSet, value, name }:any) {
    const record = dataSet.current;

    if (name === 'appService' && value) {
      handleUpdateBranch(record, value, true);
    }

    // 每一次的改变都要保存一下数据
    setData(record.toData());
  }

  // 处理load事件
  function handleLoadData({ dataSet }:any) {
    const record = dataSet.current;
    const savedAppServiceObj = record.get('appService');
    if (savedAppServiceObj) {
      handleUpdateBranch(record, savedAppServiceObj);
    }
  }

  return {
    autoCreate: true,
    events: {
      update: handleUpdate,
      load: handleLoadData,
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
        required: true,
        options: branchDs,
        textField: 'branchName',
        valueField: 'branchName',
      },
    ],
  };
};

export default PipelineBasicInfoDataSet;
