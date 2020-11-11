/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';
import { forEach } from 'lodash';

export default (projectId) => ({
  autoCreate: true,
  fields: [{
    name: 'type',
    type: 'string',
    label: '阶段属性',
    required: true,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        value: 'CI',
        text: 'CI阶段',
      }, {
        value: 'CD',
        text: 'CD阶段',
      }],
    }),
  }, {
    name: 'step',
    type: 'string',
    label: '阶段名称',
    required: true,
    maxLength: 15,
  }, {
    name: 'parallel',
    type: 'number',
    label: '任务设置',
    required: true,
    disabled: true,
  }],
});
