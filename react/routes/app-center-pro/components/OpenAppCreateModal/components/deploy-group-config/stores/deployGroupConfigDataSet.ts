import { DataSet } from 'choerodon-ui/pro';
import { FieldProps, FieldType } from '@/interface';
import { envDataSet } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';
import { deployApiConfig } from '@/api';
import { setData } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/content';
import { setKeyValue, getAppConfigData } from '@/routes/app-center-pro/components/OpenAppCreateModal';
import { devopsDeployGroupApiConfig } from '@/api/DevopsDeployGroup';

const checkPercentNum = async (value: string) => {
  const patt1 = new RegExp(/^\d+%$/);
  const patt2 = new RegExp(/^[0-9]*$/);
  if (patt1.test(value) || patt2.test(value)) {
    return true;
  }
  return '必须是百分数或者数字';
};

const checkIp = async (value: string, num: number) => {
  if (value) {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    const arr = value.split(';');
    let flag = false;
    if (arr.length > num) {
      return `最多指定${num}个IP地址`;
    }
    arr.forEach((item) => {
      if (!reg.test(item)) {
        flag = true;
      }
    });
    if (flag) {
      return '请输入正确的ip地址，多个以;号隔开';
    }
    return true;
  }
  return true;
};

const mapping: {
  [key: string]: FieldProps
} = {
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
  },
  appCode: {
    name: 'code',
    type: 'string' as FieldType,
    label: '应用编码',
    disabled: true,
  },
  env: {
    name: 'envId',
    type: 'string' as FieldType,
    label: '环境',
    options: new DataSet(envDataSet),
    textField: 'name',
    valueField: 'id',
  },
  podNum: {
    name: 'replicas',
    type: 'number' as FieldType,
    label: '副本数',
    required: true,
    defaultValue: 1,
    min: 1,
    step: 1,
  },
  MaxSurge: {
    name: 'maxSurge',
    type: 'string' as FieldType,
    label: 'MaxSurge',
    required: true,
    min: 0,
    defaultValue: '25%',
    validator: checkPercentNum,
  },
  MaxUnavailable: {
    name: 'maxUnavailable',
    type: 'string' as FieldType,
    label: 'MaxUnavailable',
    required: true,
    min: 0,
    defaultValue: '25%',
    validator: checkPercentNum,
  },
  DNSPolicy: {
    name: 'dnsPolicy',
    type: 'string' as FieldType,
    label: 'DNS Policy',
    required: true,
    defaultValue: 'ClusterFirst',
    valueField: 'value',
    textField: 'name',
    options: new DataSet({
      data: [{
        value: 'ClusterFirst',
        name: 'ClusterFirst',
      }, {
        value: 'Default',
        name: 'Default',
      }, {
        value: 'ClusterFirstWithHostNet',
        name: 'ClusterFirstWithHostNet',
      }, {
        value: 'None',
        name: 'None',
      }],
    }),
  },
  Nameservers: {
    name: 'nameServers',
    type: 'string' as FieldType,
    label: 'Nameservers',
    validator: (value) => checkIp(value, 3),
  },
  Searches: {
    name: 'searches',
    type: 'string' as FieldType,
    label: 'Searches',
    validator: (value) => checkIp(value, 6),
  },
};

const deployGroupConfigDataSet = (isPipeline: boolean) => ({
  autoCreate: true,
  transport: {
    update: (data: any) => {
      const {
        annotations,
        hostAliases,
        labels,
        nodeLabels,
        options,
      } = data.dataSet.queryParameter.dsList;
      const d = data.data[0];
      d.appName = d.name;
      d.appCode = d.code;
      setKeyValue(
        d,
        'appConfig',
        getAppConfigData({
          options,
          appConfig: d,
          annotations,
          labels,
          nodeLabels,
          hostAliases,
        }),
      );
      return devopsDeployGroupApiConfig.createDeployGroup('update', d);
    },
  },
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'env': {
        item.dynamicProps = {
          required: () => !isPipeline,
        };
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
});

export default deployGroupConfigDataSet;

export { mapping };
