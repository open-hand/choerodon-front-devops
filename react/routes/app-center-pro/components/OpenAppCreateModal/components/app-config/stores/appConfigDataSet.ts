import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import hzero from '../images/hzero.png';
import market from '../images/market.png';
import project from '../images/project.png';
import share from '../images/share.png';

const chartSourceData = [{
  value: 'project',
  name: '项目服务',
  img: project,
}, {
  value: 'share',
  name: '共享服务',
  img: share,
}, {
  value: 'market',
  name: '市场服务',
  img: market,
}, {
  value: 'hzero',
  name: 'Hzero服务',
  img: hzero,
}];

const mapping: {
  [key: string]: FieldProps;
} = {
  chartSource: {
    name: 'chartSource',
    type: 'string' as FieldType,
    label: 'Chart包来源',
  },
  hzeroVersion: {
    name: 'hzeroVersion',
    type: 'string' as FieldType,
    label: 'HZERO应用版本',
    required: true,
  },
  serviceVersion: {
    name: 'serviceVersion',
    type: 'string' as FieldType,
    label: '服务及版本',
    required: true,
  },
  env: {
    name: 'env',
    type: 'string' as FieldType,
    label: '环境',
    required: true,
  },
};

const appConfigDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default appConfigDataSet;

export { mapping, chartSourceData };
