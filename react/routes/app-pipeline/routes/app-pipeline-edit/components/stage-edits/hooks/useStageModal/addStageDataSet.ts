import { STAGE_CI } from '../../../../stores/CONSTANTS';

export default ():any => ({
  dataToJson: false,
  fields: [
    {
      name: 'name', type: 'string', label: '阶段名称', required: true, defaultValue: STAGE_CI,
    },
    {
      name: 'type', type: 'string', label: '阶段属性', required: true,
    },
  ],
});
