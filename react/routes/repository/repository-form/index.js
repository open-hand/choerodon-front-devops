import React from 'react';
import { observer } from 'mobx-react-lite';
import { C7NFormat } from '@choerodon/master';
import {
  SelectBox, Select, Form, UrlField, Icon, TextField, Password, Button,
} from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { handlePromptError } from '../../../utils';

import './index.less';

const { Option } = Select;

export default withRouter(observer(({
  record,
  dataSet,
  store,
  id,
  prefixCls,
  intlPrefix,
  formatRepository,
  formatCommon,
  isProject,
  history,
  location: { search },
}) => {
  async function refresh() {
    await dataSet.query();
  }

  async function handleSave() {
    if (record.get('harborStatus') === 'failed' || record.get('chartStatus') === 'failed') return false;
    const chartTestFailed = record.get('chartCustom') === 'custom' && !record.get('chartStatus') && !await handleTestChart();
    if (!chartTestFailed && await dataSet.submit() !== false) {
      refresh();
      return true;
    }
    return false;
  }

  async function handleTestChart() {
    try {
      if (!await record.validate()) {
        return false;
      }
      const postData = {
        url: record.get('url'),
        userName: record.get('password') && record.get('userName') ? record.get('userName') : null,
        password: record.get('password') && record.get('userName') ? record.get('password') : null,
      };
      const res = await store.checkChart(id, postData);
      if (handlePromptError(res)) {
        record.set('chartStatus', 'success');
        return true;
      }
      record.set('chartStatus', 'failed');
      return false;
    } catch (e) {
      record.set('chartStatus', 'failed');
      return false;
    }
  }

  function renderTestButton(status, handleClick) {
    return (
      <div className={`${prefixCls}-form-btnContent`}>
        <Button
          onClick={handleClick}
          funcType="raised"
          className={`${prefixCls}-form-button`}
        >
          <C7NFormat id={`${intlPrefix}.test`} />
        </Button>
        {status && (
          <span>
            <Icon
              type={status === 'success' ? 'check_circle' : 'cancel'}
              className={`${prefixCls}-form-test-${status}`}
            />
            {formatRepository({ id: `test.${status}` })}
          </span>
        )}
      </div>
    );
  }

  function handleLink() {
    history.push(`/rdupm/product-lib${search}`);
  }

  return (
    <div className={`${prefixCls}-form-wrap`}>
      {/* TODO 使用Alert组件 */}
      <div className={`${prefixCls}-form-info`}>
        <Icon type="info" className={`${prefixCls}-form-info-icon`} />
        <C7NFormat id={`${intlPrefix}.info`} />
      </div>
      {isProject ? (
        <div>
          <span className={`${prefixCls}-form-config-title`}>
            {formatRepository({ id: 'harbor.config' })}
          </span>
          <div className={`${prefixCls}-empty-page`}>
            {/* <div className={`${prefixCls}-empty-page-image`} /> */}
            <div className={`${prefixCls}-empty-page-text`}>
              <div className={`${prefixCls}-empty-page-title`}>
                {formatRepository({ id: 'empty.title' })}
              </div>
              <div className={`${prefixCls}-empty-page-des`}>
                {formatRepository({ id: 'empty.des' })}
              </div>
              <Button
                color="primary"
                onClick={handleLink}
                funcType="raised"
              >
                {formatRepository({ id: 'empty.link' })}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className={`${prefixCls}-form`}>
        <span className={`${prefixCls}-form-config-title`}>
          {formatRepository({ id: 'chart.config' })}
        </span>
        <Form record={record}>
          <SelectBox name="chartCustom">
            <Option value="default">{formatRepository({ id: 'chart.default' })}</Option>
            <Option value="custom">{formatRepository({ id: 'chart.custom' })}</Option>
          </SelectBox>
          {record.get('chartCustom') === 'custom' && ([
            <UrlField name="url" />,
            <TextField name="userName" />,
            <Password name="password" />,
            renderTestButton(record.get('chartStatus'), handleTestChart),
          ])}
        </Form>
      </div>
      <div style={{ display: 'flex' }}>
        <Button
          funcType="raised"
          onClick={refresh}
        >
          <span style={{ color: '#3f51b5' }}>{formatCommon({ id: 'cancel' })}</span>
        </Button>
        <Button
          color="primary"
          funcType="raised"
          onClick={handleSave}
          style={{ marginRight: '.12rem' }}
        >
          {formatCommon({ id: 'save' })}
        </Button>
      </div>
    </div>
  );
}));
