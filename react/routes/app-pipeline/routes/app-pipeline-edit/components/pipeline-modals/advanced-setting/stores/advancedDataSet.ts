import { DataSet } from 'choerodon-ui/pro';
import { DevopsAlienApiConfig } from '@choerodon/master';

function checkImage(value: any, name: any, record: any) {
  const pa = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}(\/.+)*:.+$/;
  if (value && pa.test(value)) {
    return true;
  }
  return '请输入格式正确的image镜像';
}

const mapping: {
  [key: string]: any
} = {
  ciRunnerImage: {
    name: 'ciRunnerImage',
    type: 'string',
    label: 'CI任务Runner镜像',
    required: true,
    validator: checkImage,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      autoQuery: true,
      transport: {
        read: () => ({
          ...DevopsAlienApiConfig.getDefaultImage(),
          transformResponse: (res) => [{
            text: res,
            value: res,
          }],
        }),
      },
    }),
  },
  shareFolderSetting: {
    name: 'share',
    type: 'string',
    label: '共享目录设置',
    textField: 'text',
    valueField: 'value',
    multiple: true,
    options: new DataSet({
      data: [{
        text: '上传共享目录choerodon-ci-cache',
        value: 'toUpload',
      }, {
        text: '下载共享目录choerodon-ci-cache',
        value: 'toDownload',
      }],
    }),
  },
  whetherConcurrent: {
    name: 'openParallel',
    type: 'boolean',
    label: '是否开启此任务的并发',
    textField: 'text',
    valueField: 'value',
    defaultValue: false,
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
    name: 'parallel',
    type: 'number',
    label: '并发数',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping, checkImage };
