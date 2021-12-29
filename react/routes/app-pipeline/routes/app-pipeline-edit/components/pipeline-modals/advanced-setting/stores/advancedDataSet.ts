import { DataSet } from 'choerodon-ui/pro';
import { DevopsAlienApiConfig } from '@choerodon/master';
import { mapping as outsideAdvancedMapping } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores/pipelineAdvancedConfigDataSet';

function checkImage(value: any, name: any, record: any) {
  const pa = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}(\/.+)*:.+$/;
  if (value && pa.test(value)) {
    return true;
  }
  return '请输入格式正确的image镜像';
}

const shareOptionsData = [{
  text: '上传共享目录choerodon-ci-cache',
  value: 'toUpload',
}, {
  text: '下载共享目录choerodon-ci-cache',
  value: 'toDownload',
}];

const mapping: {
  [key: string]: any
} = {
  ciRunnerImage: {
    name: 'image',
    type: 'string',
    label: 'CI任务Runner镜像',
    required: true,
    validator: checkImage,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      autoQuery: false,
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
      data: shareOptionsData,
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
    step: 1,
    min: 2,
    max: 50,
    dynamicProps: {
      required: ({ record }: any) => record.get(mapping.whetherConcurrent.name),
    },
  },
};

const transformSubmitData = (ds: any) => {
  const record = ds?.current;
  return ({
    [mapping.ciRunnerImage.name]: record?.get(mapping.ciRunnerImage.name),
    [mapping.whetherConcurrent.name]: record?.get(mapping.whetherConcurrent.name),
    [mapping.concurrentCount.name]: record?.get(mapping.concurrentCount.name),
    [shareOptionsData[0].value]: record
      ?.get(mapping.shareFolderSetting.name).includes(shareOptionsData[0].value),
    [shareOptionsData[1].value]: record
      ?.get(mapping.shareFolderSetting.name).includes(shareOptionsData[1].value),
  });
};

const transformLoadData = (data: any, imageRes: any) => ({
  [mapping.ciRunnerImage.name]: data?.[mapping.ciRunnerImage.name] || imageRes[0].value,
  [mapping.shareFolderSetting.name]: (function () {
    const result = [];
    if (data?.[shareOptionsData[0].value]) {
      result.push(shareOptionsData[0].value);
    }
    if (data?.[shareOptionsData[1].value]) {
      result.push(shareOptionsData[1].value);
    }
    return result;
  }()),
  [mapping.whetherConcurrent.name]: data?.[mapping.whetherConcurrent.name] || false,
  [mapping.concurrentCount.name]: data?.[mapping.concurrentCount.name],
});

const Index = (data?: any, outSideAdvancedData?: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
  events: {
    create: async ({ dataSet, record }: any) => {
      const res = await record.getField(mapping.ciRunnerImage.name).options.query();
      let flag = false;
      if (outSideAdvancedData) {
        const {
          [outsideAdvancedMapping.CIRunnerImage.name]: outsideImage,
        } = outSideAdvancedData;
        if (outsideImage !== res[0].value) {
          flag = true;
          record.getField(mapping.ciRunnerImage.name).options.loadData([
            ...res,
            {
              text: outsideImage,
              value: outsideImage,
            },
          ]);
          dataSet.loadData([transformLoadData(data, [{
            value: outsideImage,
          }])]);
        }
      }
      if (!flag) {
        dataSet.loadData([transformLoadData(data, res)]);
      }
    },
  },
});

export default Index;

export { mapping, checkImage, transformSubmitData };
