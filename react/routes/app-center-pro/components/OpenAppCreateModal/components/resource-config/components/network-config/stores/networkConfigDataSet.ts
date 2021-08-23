import some from 'lodash/some';
import forEach from 'lodash/forEach';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { serviceApi } from '@/api/Service';

async function checkName(value: string, name: string, record: any) {
  const envId = record.cascadeParent.get('environmentId');
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
}

const isRequired = ({ record }: any) => {
  const name = record.get('name');
  const dirty = some(record.getCascadeRecords('ports'), (portRecord) => portRecord.dirty);
  return !!name || dirty;
};

const mapping: {
  [key: string]: FieldProps;
} = {
  netName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '网络名称',
    dynamicProps: {
      required: isRequired,
    },
    validator: checkName,
    maxLength: 30,
  },
};

const networkConfigDataSet = () => ({
  autoCreate: true,
  autoQuery: false,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default networkConfigDataSet;
export { mapping };
