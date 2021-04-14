/* eslint-disable */
import React, { Fragment, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Form, Select, Button } from 'choerodon-ui';
import map from 'lodash/map';
import findKey from 'lodash/findKey';
import omit from 'lodash/omit';

import './index.less';

const { Item: FormItem } = Form;
const formItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

// eslint-disable-next-line func-names
const selectKeyGen = (function* (id) {
  let num = 0;
  while (true) {
    // eslint-disable-next-line no-plusplus
    num += 1;
    if (num > 10000) {
      break;
    }
    yield `key${id++}`;
  }
}(1));

function getSelectKey() {
  return selectKeyGen.next().value;
}

function getRepeatKey(data, value, field) {
  return findKey(omit(data, ['keys', field]), (item) => item === value);
}

export const SimpleSelect = injectIntl(({
  intl, uid, label, options, onDelete, removeable, form, notFoundContent, requireText,
}) => {
  const handleDelete = useCallback(() => {
    onDelete(uid);
  }, [uid]);

  function uniqValid(rule, value, callback) {
    if (!value) callback(requireText);

    const { field } = rule;
    const data = form.getFieldsValue();
    const repeatKey = getRepeatKey(data, value, field);

    if (repeatKey) {
      const text = intl.formatMessage({ id: 'noRepeat' });
      callback(text);
    }

    callback();
  }

  return (
    <FormItem
      {...formItemLayout}
      className="c7ncd-dynamic-select"
      key={uid}
    >
      {form.getFieldDecorator(uid, {
        rules: [{
          required: true,
          validator: uniqValid,
        }],
      })(<Select
        required
        searchable
        filter
        optionFilterProp="children"
        notFoundContent={notFoundContent}
        filterOption={(input, option) => option.props.children.props.children
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0}
        label={label}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
      >
        {options}
      </Select>)}
      <Button
        className="c7ncd-dynamic-select-remove"
        disabled={!removeable}
        shape="circle"
        icon="delete"
        onClick={handleDelete}
      />
    </FormItem>
  );
});

SimpleSelect.propTypes = {
  uid: PropTypes.string.isRequired,
  options: PropTypes.array,
  label: PropTypes.string,
  removeable: PropTypes.bool,
  onDelete: PropTypes.func,
  notFoundContent: PropTypes.string,
  requireText: PropTypes.string,
};

SimpleSelect.defaultProps = {
  label: '',
  options: [],
};

export default function DynamicSelect({
  form, label, fieldKeys, options, addText, notFoundContent, requireText,
}) {
  function add() {
    const keys = form.getFieldValue('keys');
    if (!keys) return;
    const newKey = getSelectKey();
    const nextKeys = keys.concat(newKey);
    form.setFieldsValue({ keys: nextKeys });
  }

  function remove(k) {
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter((key) => key !== k),

      /**
       * NOTE: 移除keys中的表单标识，会先触发下面的data更新，而此时在获取的表单信息中，被移除的项依然存在
       * 导致先渲染options，再更新dom，结果是每次可选择的项目中没有刚被删除的项目
       * */

      [k]: undefined,
    });
  }

  const keys = useMemo(() => fieldKeys.keys, [fieldKeys]);
  // const disabledAdd = options.length <= 1 || (keys && keys.length >= options.length);

  return (
    <>
      {map(keys, (key, index) => (
        <SimpleSelect
          key={key}
          uid={key}
          form={form}
          notFoundContent={notFoundContent}
          requireText={requireText}
          options={options}
          removeable={index > 0 || (keys && keys.length > 1)}
          onDelete={remove}
          label={label}
        />
      ))}
      <FormItem>
        <Button
          icon="add"
          type="primary"
          funcType="flat"
          onClick={add}
        >
          {addText}
        </Button>
      </FormItem>
    </>
  );
}

DynamicSelect.propTypes = {
  options: PropTypes.array,
  fieldKeys: PropTypes.shape({
    keys: PropTypes.array,
  }),
  label: PropTypes.string,
  addText: PropTypes.string,
  notFoundContent: PropTypes.string,
  requireText: PropTypes.string,
};

DynamicSelect.defaultProps = {
  label: '',
  addText: '',
};
