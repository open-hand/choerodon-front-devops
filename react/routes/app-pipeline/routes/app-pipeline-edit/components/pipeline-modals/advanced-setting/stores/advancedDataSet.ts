import { DataSet } from 'choerodon-ui/pro';

const mapping: {
  [key: string]: any
} = {
  ciRunnerImage: {
    name: 'ciRunnerImage',
    type: 'string',
    label: 'CI任务Runner镜像',
  },
  shareFolderSetting: {
    name: 'shareFolderSetting',
    type: 'string',
    label: '共享目录设置',
    textField: 'text',
    valueField: 'value',
    multiple: true,
    options: new DataSet({
      data: [{
        text: '上传共享目录choerodon-ci-cache',
        value: '1',
      }, {
        text: '下载共享目录choerodon-ci-cache',
        value: '2',
      }],
    }),
  },
  whetherConcurrent: {
    name: 'whetherConcurrent',
    type: 'boolean',
    label: '是否开启此任务的并发',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  concurrentCount: {
    name: 'concurrentCount',
    type: 'number',
    label: '并发数',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping };
