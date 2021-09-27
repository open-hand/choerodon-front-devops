import some from 'lodash/some';
import forEach from 'lodash/forEach';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSet } from 'choerodon-ui/pro';
import { serviceApi } from '@/api/Service';

const isRequired = ({ record }: any) => {
  const name = record.get('name');
  const dirty = some(record.getCascadeRecords('ports'), (portRecord) => portRecord.dirty);
  return !!name || dirty;
};

const checkIP = async (value: string, name: string, record: any) => {
  const p = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
  let errorMsg;
  if (value) {
    if (!p.test(value)) {
      errorMsg = '请输入正确的ip，类似 (0-255).(0-255).(0-255).(0-255)';
    }
    return errorMsg;
  }
  return true;
};

const mapping: {
  [key: string]: FieldProps;
} = {
  netName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '网络名称',
    // required: true,
    dynamicProps: {
      required: isRequired,
    },
    maxLength: 30,
  },
  netType: {
    name: 'type',
    type: 'string' as FieldType,
    defaultValue: 'ClusterIP',
    label: '网络类型',
    dynamicProps: {
      required: isRequired,
    },
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: [{
        value: 'ClusterIP',
        name: 'ClusterIP',
      }, {
        value: 'NodePort',
        name: 'NodePort',
      }, {
        value: 'LoadBalancer',
        name: 'LoadBalancer',
      }],
    }),
  },
  externalIp: {
    name: 'externalIp',
    label: '外部IP',
    multiple: true,
    validator: checkIP,
  },
};

const networkConfigDataSet = (envId: string, PortsDataSet: any) => {
  const checkName = async (value: string, name: string, record: any) => {
    if (!envId) {
      return;
    }
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && !pattern.test(value)) {
      // eslint-disable-next-line consistent-return
      return '名称只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
    } if (value && pattern.test(value)) {
      const res = await serviceApi.checkEnvName(envId, value);
      if (!res) {
        // eslint-disable-next-line consistent-return
        return '名称已存在';
      }
    }
  };
  return ({
    autoCreate: true,
    autoQuery: false,
    children: {
      ports: PortsDataSet,
    },
    fields: Object.keys(mapping).map((i) => {
      const item = mapping[i];
      switch (i) {
        case 'netName': {
          item.validator = checkName;
          break;
        }
        default: {
          break;
        }
      }
      return item;
    }),
  });
};

export default networkConfigDataSet;
export { mapping };
