import { STAGE_CI } from '../../../../stores/CONSTANTS';

export default ():any => ({
  fields: [
    {
      name: 'name', type: 'string', label: '阶段名称', require: true,
    },
    {
      name: 'type', type: 'string', label: '阶段属性', require: true,
    },
  ],
});
