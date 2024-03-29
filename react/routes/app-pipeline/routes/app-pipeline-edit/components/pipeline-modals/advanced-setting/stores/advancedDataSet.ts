import { DataSet } from 'choerodon-ui/pro';
import { DevopsAlienApiConfig } from '@choerodon/master';
import { mapping as outsideAdvancedMapping } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores/pipelineAdvancedConfigDataSet';
import { handleOk } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/content';

function checkImage(value: any) {
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
    textField: 'text',
    valueField: 'value',
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

const transformLoadData = (data: any, imageRes: any) => {
  const data2 = {
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
    [mapping.whetherConcurrent.name]: Boolean(data?.[mapping.concurrentCount.name]
      && data?.[mapping.concurrentCount.name] > 0),
    [mapping.concurrentCount.name]: data?.[mapping.concurrentCount.name],
  };
  return data2;
};

const Index = ({
  data,
  outSideAdvancedData,
  level,
  handleJobAddCallback,
}: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'ciRunnerImage': {
        item.options = new DataSet({
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
        });
        item.dynamicProps = {
          required: () => level === 'project',
        };
        // item.validator = (value: any) => {
        //   if (level === 'project') {
        //     return checkImage(value);
        //   }
        //   return true;
        // };

        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
  events: {
    create: async ({ dataSet, record }: any) => {
      const dataImage = data?.image;
      const oldImage = data?.oldImage;
      const res = await record.getField(mapping.ciRunnerImage.name).options.query();
      let flag = false;
      const optionsData = [...res];
      if (dataImage !== res[0].value) {
        optionsData.push({
          text: dataImage,
          value: dataImage,
        });
      }
      if (oldImage && oldImage !== dataImage && oldImage !== res[0].image) {
        optionsData.push({
          text: oldImage,
          value: oldImage,
        });
      }
      if (outSideAdvancedData) {
        const {
          [outsideAdvancedMapping.CIRunnerImage.name]: outsideImage,
        } = outSideAdvancedData;
        if (outsideImage !== res[0].value) {
          flag = true;
          optionsData.push({
            text: outsideImage,
            value: outsideImage,
          });
          dataSet.loadData([transformLoadData(data, [{
            value: outsideImage,
          }])]);
        }
      }
      record.getField(mapping.ciRunnerImage.name).options.loadData(optionsData);
      if (!flag) {
        dataSet.loadData([transformLoadData(data, res)]);
      }
    },
    update: ({
      dataSet, name, value, record,
    }: any) => {
      switch (name) {
        case mapping.whetherConcurrent.name: {
          if (!value) {
            record.set(mapping.concurrentCount.name, undefined);
          }
          break;
        }
        default: {
          break;
        }
      }
      const {
        template,
        type,
        appService,
        id,
      } = data;
      if (!template) {
        handleOk({
          canWait: false,
          advancedRef: {
            current: {
              getDataSet: () => dataSet,
            },
          },
          level,
          template,
          handleJobAddCallback,
          type,
          appService,
          id,
          data,
        });
      }
    },
  },
});

export default Index;

export { mapping, checkImage, transformSubmitData };
