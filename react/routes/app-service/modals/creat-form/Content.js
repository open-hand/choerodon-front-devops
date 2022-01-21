import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Form, TextField, Select, Tooltip, SelectBox, Spin, Password,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Alert, Button } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/master';
import map from 'lodash/map';
import includes from 'lodash/includes';
import { CustomSelect, TestConnect } from '@choerodon/components';
import Tips from '../../../../components/new-tips';
import { useCreateAppServiceStore } from './stores';
import { appServiceApi } from '@/api/AppService';

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
    appServiceId,
    format,
  } = useCreateAppServiceStore();
  const record = formDs.current;
  const [testStatus, setTestStatus] = useState('loading');
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setIsShow(false);
  }, [record.get('authType')]);

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
    if (record.get('gitLabType') === 'outGitlab' || appServiceId) {
      if (!await handleTest()) {
        return false;
      }
    }
    const res = await formDs.submit();
    try {
      if (res) {
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

  const renderSourceOption = ({ text }) => (
    <Tooltip title={text} placement="left">
      {text}
    </Tooltip>
  );

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
  const isTestDisable = record.get('repositoryUrl') && ((record.get('username') && record.get('password') && record.get('authType') === 'username_password') || (record.get('accessToken') && record.get('authType') === 'access_token'));
  const gitlabSelectList = [{ gitLabType: 'inGitlab', value: formatMessage({ id: 'c7ncd.appService.code.registry.buildin' }) }, { gitLabType: 'outGitlab', value: formatMessage({ id: 'c7ncd.appService.code.registry.External' }) }];
  const authTypeList = [{ authType: 'username_password', title: formatMessage({ id: 'c7ncd.appService.Usernameandpassword' }), content: formatMessage({ id: 'c7ncd.appService.Usernameandpassword.content' }) }, { authType: 'access_token', title: formatMessage({ id: 'c7ncd.appService.PrivateToken' }), content: formatMessage({ id: 'c7ncd.appService.PrivateToken.content' }) }];
  const renderTemplateOption = useCallback(({ value, text, record: optionRecord }) => {
    if (optionRecord?.get('remark')) {
      return <Tips title={text} helpText={optionRecord?.get('remark')} />;
    }
    return text;
  }, []);
  const handleGitLabChange = (val) => {
    formDs.current.set('gitLabType', val.gitLabType);
  };
  const handleAuthTypeChange = (val) => {
    formDs.current.set('authType', val.authType);
  };

  const handleTest = async (val) => {
    let res;
    setIsShow(true);
    setTestStatus('loading');
    try {
      res = await appServiceApi.testConnection({
        repositoryUrl: record.get('repositoryUrl'),
        authType: record.get('authType'),
        accessToken: record.get('authType') === 'access_token' ? record.get('accessToken') : null,
        username: record.get('authType') === 'username_password' ? record.get('username') : null,
        password: record.get('authType') === 'username_password' ? record.get('password') : null,
      });
      setTimeout(() => {
        setTestStatus(res ? 'success' : 'failed');
      }, 0);
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
    return res;
  };
  return (
    <div className={`${prefixCls}-create-wrap`}>
      {!appServiceId
        && (
          <>
            <div className="create-tips">
              <Tips
                helpText={formatMessage({ id: `${intlPrefix}.type.tips` })}
                title={formatMessage({ id: 'c7ncd.appService.type' })}
              />
            </div>
            <Form dataSet={formDs}>
              <SelectBox
                name="type"
                className="type-select"
              >
                <Option value="normal">
                  {formatMessage({ id: `${intlPrefix}.type.normal` })}
                </Option>
                <Option value="test">{formatMessage({ id: `${intlPrefix}.type.test` })}</Option>
              </SelectBox>
              <TextField
                name="code"
                autoFocus
                addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.code.tips` })} />}
              />
              <TextField name="name" colSpan={3} />

            </Form>
            <div className="create-tips">
              <Tips
                helpText={formatMessage({ id: `${intlPrefix}.codeRepository.tips` })}
                title={formatMessage({ id: 'c7ncd.appService.code.registry' })}
              />
            </div>
            <Form dataSet={formDs}>
              <div className="customSelect-wrapper">
                <CustomSelect
                  disabledKeys={formDs.current.get('disabledValue')}
                  onClickCallback={(val) => { handleGitLabChange(val); }}
                  data={gitlabSelectList}
                  selectedKeys={formDs.current.get('gitLabType')}
                  identity="gitLabType"
                  mode="single"
                  customChildren={(item) => (
                    <div className="customSelect-item">{item.value}</div>
                  )}
                />
              </div>
              {
                formDs.current.get('gitLabType') === 'outGitlab'
                && (
                  <Alert
                    className="outGitlab-alert"
                    message={(
                      <div>
                        {formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips.attention` })}
                        <br />
                        {formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips.one` })}
                        <br />
                        {formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips.two` })}
                        <br />
                        {formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips.three` })}
                        <br />
                        {formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips.four` })}
                      </div>
        )}
                    type="warning"
                    showIcon
                  />
                )
              }

            </Form>

          </>
        )}
      {
        (formDs.current.get('gitLabType') === 'inGitlab' && !appServiceId) ? (
          <>
            <div className={`${prefixCls}-create-wrap-template-title`}>
              <Tips
                helpText={formatMessage({ id: `${intlPrefix}.template.tips` })}
                title={formatMessage({ id: `${intlPrefix}.template` })}
              />
            </div>
            <div className="create-tips">{ formatMessage({ id: 'c7ncd.appService.template.source' }) }</div>
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
                    addonAfter={<Tips helpText={formatMessage({ id: 'c7ncd.org-template.tips' })} />}
                    optionRenderer={renderTemplateOption}
                  />
                )
              }
            </Form>
          </>
        ) : (
          <>
            <div className={appServiceId ? `${prefixCls}-create-wrap-template-outTitle` : `${prefixCls}-create-wrap-template-title`}>
              {formatMessage({ id: 'c7ncd.appService.Warehouse' })}
            </div>
            <Form dataSet={formDs}>
              <TextField name="repositoryUrl" disabled={appServiceId} addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.gitLabRepositoryUrl.tips` })} />} />
            </Form>
            <div className="create-tips">
              <Tips
                helpText={formatMessage({ id: `${intlPrefix}.approve.setting.tips` })}
                title={formatMessage({ id: `${intlPrefix}.approve.setting` })}
              />
            </div>
            <Form dataSet={formDs}>
              <div className="customSelect-wrapper">
                <CustomSelect
                  onClickCallback={(val) => { handleAuthTypeChange(val); }}
                  data={authTypeList}
                  identity="authType"
                  selectedKeys={appServiceId ? formDs.current?.get('authType') : 'username_password'}
                  mode="single"
                  customChildren={(item) => (
                    <div className="customSelect-authType-item">
                      <div className="title">{item.title}</div>
                      <div className="content">{item.content}</div>
                    </div>
                  )}
                />
              </div>
              {formDs.current?.get('authType') === 'username_password' ? (
                <>
                  <TextField name="username" colSpan={3} />
                  <Password name="password" colSpan={3} />
                </>
              ) : <Password name="accessToken" colSpan={3} />}
            </Form>
            <div className="testConnect">
              <Button funcType="raised" disabled={!isTestDisable} onClick={handleTest}>
                {formatMessage({ id: 'c7ncd.appService.Testlink' })}
              </Button>
              {(isTestDisable && isShow)
                && <TestConnect status={testStatus} />}
            </div>
          </>
        )
      }
    </div>
  );
}));

export default CreateForm;
