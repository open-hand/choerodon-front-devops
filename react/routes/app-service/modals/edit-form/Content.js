import React, { useEffect } from 'react';
import { Form, TextField, Select } from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Icon, Input, Divider } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/boot';
import includes from 'lodash/includes';
import { handlePromptError } from '../../../../utils';
import Settings from './Settings';
import { useEditAppServiceStore } from './stores';
import Loading from '../../../../components/loading';

import './index.less';

const FILE_TYPE = 'image/png, image/jpeg, image/gif, image/jpg';

const CreateForm = injectIntl(observer((props) => {
  const {
    modal,
    store,
    AppState: { currentMenuType: { projectId, organizationId } },
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
    refresh,
    formDs,
  } = useEditAppServiceStore();
  const record = formDs.current;
  if (!record) {
    return <Loading display />;
  }

  modal.handleOk(async () => {
    if (record.get('chartStatus') === 'failed') return false;
    try {
      const chartTestFailed = record.get('chartType') === 'custom' && !record.get('chartStatus') && !await handleTestChart();
      if (!chartTestFailed && (await formDs.submit()) !== false) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  /**
   * 触发上传按钮
   */
  function triggerFileBtn() {
    const ele = document.getElementById('file');
    ele.click();
  }

  /**
   * 选择文件
   * @param e
   */
  const selectFile = async (e) => {
    const formdata = new FormData();
    const img = e.target.files[0];
    if (!includes(FILE_TYPE, img.type)) {
      Choerodon.prompt(formatMessage({ id: `${intlPrefix}.file.failed` }));
      return;
    }
    formdata.append('file', e.target.files[0]);
    try {
      const data = await axios.post(
        `/hfle/v1/${organizationId}/files/multipart?bucketName=devops-service&fileName=${img.name.split('.')[0]}`,
        formdata,
        {
          header: { 'Content-Type': 'multipart/form-data' },
        },
      );
      if (data) {
        record.set('imgUrl', data);
      }
    } catch (err) {
      Choerodon.handleResponseError(e);
    }
  };

  const handleTestChart = async () => {
    try {
      if (!await record.validate()) {
        return false;
      }
      const postData = {
        url: record.get('url'),
        userName: record.get('password') && record.get('userName') ? record.get('userName') : null,
        password: record.get('password') && record.get('userName') ? record.get('password') : null,
      };
      const res = await store.checkChart(projectId, postData);
      if (handlePromptError(res, false)) {
        record.set('chartStatus', 'success');
        return true;
      }
      record.set('chartStatus', 'failed');
      return false;
    } catch (e) {
      record.set('chartStatus', 'failed');
      return false;
    }
  };

  return (
    <div className={`${prefixCls}-create-wrap`}>
      <div
        style={{
          backgroundImage: record.get('imgUrl') ? `url('${record.get('imgUrl')}')` : '',
        }}
        className={`${prefixCls}-create-img`}
        onClick={triggerFileBtn}
        role="none"
      >
        <div className="'edit-img-mask">
          <Icon type="photo_camera" className="edit-img-icon" />
        </div>
        {!record.get('imgUrl') && (
        <div className="edit-avatar">
          <span>{record.get('name') && record.get('name').slice(0, 1)}</span>
        </div>
        )}
        <Input
          id="file"
          type="file"
          accept={FILE_TYPE}
          onChange={selectFile}
          style={{ display: 'none' }}
        />
      </div>
      <div className={`${prefixCls}-create-text`}>
        <FormattedMessage id={`${intlPrefix}.icon`} />
      </div>
      <Form record={record}>
        <TextField name="name" autoFocus />
      </Form>
      <Settings record={record} handleTestChart={handleTestChart} />
      <Divider className="c7ncd-form-divider" />
      <div className="content-settings-title">
        <span>POM信息</span>
      </div>
      <Form record={record}>
        <TextField name="artifactId" />
        <TextField name="groupId" />
      </Form>
    </div>
  );
}));

export default CreateForm;
