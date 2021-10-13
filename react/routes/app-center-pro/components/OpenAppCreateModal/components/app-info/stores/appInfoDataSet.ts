import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Record } from '@/interface';
import { hostDataSetConfig } from '../../host-app-config/stores/hostAppConfigDataSet';
import { envDataSet } from '../../app-config/stores/appConfigDataSet';
import { deployAppCenterApi, hostApi } from '@/api';
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
  description: '支持将制品库、应用市场或本地的jar包部署至主机',
}, {
  value: 'other',
  name: '其他制品',
  description: '支持本地上传或远程拉取各种类型的制品部署至主机',
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
    validator: async (value, type, record: Record) => {
      let res: any = '应用名称已重复';
      const needCheckEnv = record.getState('checkEnv');
      if (record?.get(mapping.deployMode.name) === deployModeOptionsData[0].value && needCheckEnv) {
        if (record.get(mapping.env.name)) {
          const flag = await deployAppCenterApi.checkAppName(
            value,
            undefined,
            undefined,
            record.get(mapping.env.name),
          );
          if (flag) {
            res = true;
          }
        } else {
          res = '请先选择环境';
        }
      } else {
        const flag = await hostApi.checkAppName(value);
        if (flag) {
          res = true;
        }
      }
      return res;
    },
  },
  appCode: {
    name: 'appCode',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
    maxLength: 53,
    validator: async (value, name, record: Record) => {
      const flag = LCLETTER_NUM.test(value);
      const needCheckEnv = record.getState('checkEnv');
      if (!flag) {
        return '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
      }
      let res: any = '应用编码重复';
      if (record?.get(mapping.deployMode.name) === deployModeOptionsData[0].value && needCheckEnv) {
        if (record.get(mapping.env.name)) {
          const res1 = await deployAppCenterApi.checkAppCode(
            value,
            undefined,
            undefined,
            record.get(mapping.env.name),
          );
          if (res1) {
            res = true;
          }
        } else {
          res = '请先选择环境';
        }
      } else {
        const res1 = await hostApi.checkAppCode(value);
        if (res1) {
          res = true;
        }
      }
      return res;
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
  env: {
    name: 'environmentId',
    type: 'string' as FieldType,
    label: '环境',
    options: new DataSet(envDataSet),
    textField: 'name',
    valueField: 'id',
    dynamicProps: {
      required: ({ record }) => record.get(mapping.deployMode.name)
      === deployModeOptionsData[0].value,
    },
  },
  host: {
    name: 'hostId',
    type: 'string' as FieldType,
    label: '主机',
    textField: 'name',
    valueField: 'id',
    options: new DataSet(hostDataSetConfig()),
    dynamicProps: {
      required: ({ record }) => record.get(mapping.deployMode.name)
      === deployModeOptionsData[1].value,
    },
  },
};

const appInfoDataSet = (envId: string | undefined) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'env': {
        item.defaultValue = envId || undefined;
        item.disabled = Boolean(envId);
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
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
