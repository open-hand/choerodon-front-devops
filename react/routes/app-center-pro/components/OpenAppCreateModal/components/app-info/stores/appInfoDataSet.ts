import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Record } from '@/interface';
import container from '../images/container.png';
import host from '../images/host.png';

const {
  LCLETTER_NUM,
} = CONSTANTS;

const deployModeOptionsData = [{
  value: 'container',
  name: '容器部署',
  description: '支持将Chart包或工作负载部署至k8s集群',
  img: container,
}, {
  value: 'host',
  name: '主机部署',
  description: '支持将制品库或本地的制品部署至主机',
  img: host,
}];

const deployProductOptionsData = [{
  value: 'chart',
  name: 'Chart包',
  description: '通过Helm将Chart包部署至k8s集群',
}, {
  value: 'deployGroup',
  name: '部署组',
  description: '通过创建与配置Deployment部署应用至k8s集群',
}, {
  value: 'jar',
  name: 'jar包',
  description: '123',
}, {
  value: 'other',
  name: '其他制品',
  description: '123',
}];

const mapping: {
  [key: string]: FieldProps;
} = {
  appName: {
    name: 'appName',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
    maxLength: 64,
    // validator: handleValidateAppName
  },
  appCode: {
    name: 'appCode',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
    maxLength: 53,
    validator: async (value) => {
      const flag = LCLETTER_NUM.test(value);
      if (flag) {
        return true;
      }
      return '名称只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
    },
  },
  deployMode: {
    name: 'deployMode',
    type: 'string' as FieldType,
    label: '部署模式',
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: deployModeOptionsData,
    }),
    defaultValue: deployModeOptionsData[0].value,
  },
  deployProductType: {
    name: 'deployProductType',
    type: 'string' as FieldType,
    label: '部署制品类型',
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: deployProductOptionsData,
    }),
    defaultValue: deployProductOptionsData[0].value,
  },
};

const appInfoDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
  events: {
    update: ({ record, name, value }: {
      record: Record,
      name: string,
      value: string,
    }) => {
      switch (name) {
        case mapping.deployMode.name: {
          if (value === deployModeOptionsData[0].value) {
            record.set(mapping.deployProductType.name as string, deployProductOptionsData[0].value);
          } else {
            record.set(mapping.deployProductType.name as string, deployProductOptionsData[2].value);
          }
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export { mapping, deployModeOptionsData, deployProductOptionsData };

export default appInfoDataSet;
