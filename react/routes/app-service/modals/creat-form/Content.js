import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Form, TextField, Select, Tooltip, SelectBox, Spin,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Icon, Input } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/boot';
import map from 'lodash/map';
import includes from 'lodash/includes';
import Tips from '../../../../components/new-tips';
import { useCreateAppServiceStore } from './stores';

import './index.less';

const { Option, OptGroup } = Select;
const FILE_TYPE = 'image/png, image/jpeg, image/gif, image/jpg';

const CreateForm = injectIntl(observer((props) => {
  const {
    modal,
    store,
    AppState: { currentMenuType: { organizationId } },
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
    refresh,
    formDs,
  } = useCreateAppServiceStore();
  const record = formDs.current;

  const optionLoading = useMemo(() => (
    <Option value="loading">
      <div
        className="c7ncd-select-option-loading"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        role="none"
      >
        <Spin />
      </div>
    </Option>
  ), []);

  modal.handleOk(async () => {
    try {
      if (await formDs.submit() !== false) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
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
  async function selectFile(e) {
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
  }

  function renderSourceOption({ text }) {
    return (
      <Tooltip title={text} placement="left">
        {text}
      </Tooltip>
    );
  }

  function getAppServiceOptions() {
    if (store.getAppServiceLoading || !record) {
      return optionLoading;
    }
    return (record.get('appServiceSource') === 'normal_service' ? (
      map(store.getAppService[0]
        && store.getAppService[0].appServiceList, ({ id, name }) => (
          <Option value={id} key={id}>{name}</Option>
      ))
    ) : (
      map(store.getAppService, ({ id: groupId, name: groupName, appServiceList }) => (
        <OptGroup label={groupName} key={groupId}>
          {map(appServiceList, ({ id, name }) => (
            <Option value={id} key={id}>{name}</Option>
          ))}
        </OptGroup>
      ))
    ));
  }

  const renderTemplateOption = useCallback(({ value, text, record: optionRecord }) => {
    if (optionRecord?.get('remark')) {
      return <Tips title={text} helpText={optionRecord?.get('remark')} />;
    }
    return text;
  }, []);

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
        <div className="create-img-mask">
          <Icon type="photo_camera" className="create-img-icon" />
        </div>
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
      <Form dataSet={formDs}>
        <Select
          name="type"
          clearButton={false}
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.type.tips` })} />}
        >
          <Option value="normal">
            {formatMessage({ id: `${intlPrefix}.type.normal` })}
          </Option>
          <Option value="test">
            {formatMessage({ id: `${intlPrefix}.type.test` })}
          </Option>
        </Select>
        <TextField
          name="code"
          autoFocus
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.code.tips` })} />}
        />
        <TextField name="name" colSpan={3} />
      </Form>
      <div className={`${prefixCls}-create-wrap-template-title`}>
        <Tips
          helpText={formatMessage({ id: `${intlPrefix}.template.tips` })}
          title={formatMessage({ id: `${intlPrefix}.template` })}
        />
      </div>
      <Form dataSet={formDs} className={`${prefixCls}-create-wrap-form`}>
        <SelectBox name="appServiceSource" optionRenderer={renderSourceOption} />
        {
        ['normal_service', 'share_service'].includes(formDs.current.get('appServiceSource')) ? [
          <Select
            name="templateAppServiceId"
            searchable
            disabled={!record.get('appServiceSource')}
            notFoundContent={<FormattedMessage id={`${intlPrefix}.empty`} />}
          >
            {getAppServiceOptions()}
          </Select>,
          <Select
            name="templateAppServiceVersionId"
            searchable
            searchMatcher="version"
            clearButton={false}
            disabled={!record.get('templateAppServiceId')}
          />,
        ] : (
          <Select
            name="devopsAppTemplateId"
            searchable
            searchMatcher="param"
            addonAfter={<Tips helpText={formatMessage({ id: 'c7ncd.template.tips' })} />}
            optionRenderer={renderTemplateOption}
          />
        )
      }
      </Form>
    </div>
  );
}));

export default CreateForm;
