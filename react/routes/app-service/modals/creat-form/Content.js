import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Form, TextField, Select, Tooltip, SelectBox, Spin,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Alert, Button } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/boot';
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
  } = useCreateAppServiceStore();
  const record = formDs.current;
  const [testStatus, setTestStatus] = useState('loading');
  const [isShow, setIsShow] = useState(false);
  useEffect(() => {
    setIsShow(false);
  },
  [record.get('authType')]);
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
  const gitlabSelectList = [{ gitLabType: 'inGitlab', value: '内置GitLab仓库' }, { gitLabType: 'outGitlab', value: '外置GitLab仓库' }];
  const authTypeList = [{ authType: 'username_password', title: '用户名与密码', content: '需至少输入该仓库内Maintainer角色的用户名和密码' }, { authType: 'access_token', title: '私有Token', content: '需至少使用Maintainer角色在GitLab中创建含有api权限的Access Token' }];
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
    try {
      res = await appServiceApi.testConnection({
        repositoryUrl: record.get('repositoryUrl'),
        authType: record.get('authType'),
        accessToken: record.get('authType') === 'access_token' ? record.get('accessToken') : null,
        username: record.get('authType') === 'username_password' ? record.get('username') : null,
        password: record.get('authType') === 'username_password' ? record.get('password') : null,
      });
      setTestStatus(res ? 'success' : 'failed');
      setIsShow(true);
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
                title="服务类型"
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
                title="代码仓库"
              />
            </div>
            <Form dataSet={formDs}>
              <div className="customSelect-wrapper">
                <CustomSelect
                  disabledKeys={formDs.current.get('type') === 'test' ? 'outGitlab' : ''}
                  onClickCallback={(val) => { handleGitLabChange(val); }}
                  data={gitlabSelectList}
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
                    message={formatMessage({ id: `${intlPrefix}.outGitlab.alert.tips` })}
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
            <div className="create-tips">模板来源</div>
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
          </>
        ) : (
          <>
            <div className={appServiceId ? `${prefixCls}-create-wrap-template-outTitle` : `${prefixCls}-create-wrap-template-title`}>
              仓库配置
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
                  <TextField name="password" colSpan={3} />
                </>
              ) : <TextField name="accessToken" colSpan={3} />}
            </Form>
            <div className="testConnect">
              <Button funcType="raised" disabled={!isTestDisable} onClick={handleTest}>
                测试链接
              </Button>
              { (isTestDisable && isShow)
                && <TestConnect status={testStatus} failedMessage="失败原因" />}
            </div>
          </>
        )
      }
    </div>
  );
}));

export default CreateForm;
