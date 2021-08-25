import { DataSet } from 'choerodon-ui/pro';
import map from 'lodash/map';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { DataSetSelection } from '@/interface';

function checkPort(value: string, type: string, record: any) {
  const p = /^([1-9]\d*|0)$/;
  const isRepeat = record
    .dataSet
    .some((r: { id: any; get: (arg0: string) => string; }) => record.id !== r.id
      && r.get(type) === value);

  const data = {
    typeMsg: '',
    min: 0,
    max: 65535,
    failedMsg: '端口在0-65535之间',
  };

  switch (type) {
    case 'targetPort':
      data.typeMsg = '目标端口号重复';
      break;
    case 'nodePort':
      data.typeMsg = '节点端口号重复';
      data.min = 30000;
      data.max = 32767;
      data.failedMsg = '在30000-32767之间';
      break;
    default:
      data.typeMsg = '端口号重复';
  }
  if (value) {
    if (
      p.test(value)
      && parseInt(value, 10) >= data.min
      && parseInt(value, 10) <= data.max
    ) {
      if (!isRepeat) {
        return true;
      }
      return data.typeMsg;
    }
    return data.failedMsg;
  }
  return true;
}

function isRequired({ dataSet, record }: any) {
  const name = record.cascadeParent.get('name');
  const dirty = dataSet.some((portRecord: { dirty: any; }) => portRecord.dirty);
  return dirty || !!name;
}

const protocolDs = new DataSet({
  data: [
    {
      value: 'TCP',
    },
    {
      value: 'UDP',
    },
  ],
  selection: 'single' as DataSetSelection,
});

function checkOtherRecords(record: any, type: string) {
  record.dataSet.forEach((r: any) => {
    if (r.id !== record.id) {
      // 此处只对重复性做校验，不对空值做校验
      if (r.get(type)) {
        r.getField(type).checkValidity();
      }
    }
  });
}

function handleUpdate({ dataSet, record, name }: any) {
  if (name !== 'protocol') {
    checkOtherRecords(record, name);
  }
  if (name === 'port') {
    // eslint-disable-next-line consistent-return
    const ports = map(dataSet.toData(), ({ port }) => {
      if (port) {
        return Number(port);
      }
    });
    // TODO
    // pathListDs.forEach((pathRecord) => pathRecord.init('ports', ports));
  }
}

const portsDataSet = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'nodePort',
      type: 'string',
      label: '节点端口',
      validator: checkPort,
      maxLength: 5,
    },
    {
      name: 'port',
      type: 'string',
      label: '端口',
      validator: checkPort,
      dynamicProps: {
        required: isRequired,
      },
      maxLength: 5,
    },
    {
      name: 'targetPort',
      type: 'string',
      label: '目标端口',
      required: true,
      validator: checkPort,
      dynamicProps: {
        required: isRequired,
      },
      maxLength: 5,
    },
    {
      name: 'protocol',
      type: 'string',
      label: '协议',
      textField: 'value',
      valueField: 'value',
      dynamicProps: {
        required: ({ dataSet, record }: any) => isRequired({ dataSet, record }) && record.cascadeParent.get('type') === 'NodePort',
      },
      options: protocolDs,
    },
  ] as FieldProps[],
  events: {
    update: handleUpdate,
  },
});

export default portsDataSet;
