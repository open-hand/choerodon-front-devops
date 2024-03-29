/* eslint-disable react/jsx-no-bind */
import React, { useEffect, useState, Fragment } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import {
  Header, Choerodon, HeaderButtons, ButtonGroup, useFormatMessage,
} from '@choerodon/master';
import {
  Button, Select, Form, Menu, Dropdown, Icon, UrlField, TextField,
} from 'choerodon-ui/pro';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import handleMapStore from '../main-view/store/handleMapStore';
import { useCodeManagerStore } from '../stores';
import './index.less';

const { Option, OptGroup } = Select;

const CodeManagerToolBar = injectIntl(inject('AppState')(observer((props) => {
  const { appServiceDs, selectAppDs } = useCodeManagerStore();
  useEffect(() => {
    handleRefresh();
  }, [selectAppDs.current]);

  const { name, intl: { formatMessage }, type } = props;
  const currentApp = _.find(appServiceDs.toData(), ['id', selectAppDs.current.get('appServiceId')]);
  const noRepoUrl = formatMessage({ id: 'repository.noUrl' });
  const getSelfToolBar = () => {
    const obj = handleMapStore[name]
      && handleMapStore[name].getSelfToolBar
      && handleMapStore[name].getSelfToolBar();
    return obj || null;
  };
  const getSelfToolBarObj = () => {
    const obj = handleMapStore[name]
      && handleMapStore[name].getSelfToolBarObj
      && handleMapStore[name].getSelfToolBarObj();
    return obj || null;
  };
  /**
   * 点击复制代码成功回调
   * @returns {*|string}
   */
  const handleCopy = () => { Choerodon.prompt('复制成功'); };

  const handleRefresh = () => {
    handleMapStore[name] && handleMapStore[name].refresh();
  };

  const refreshApp = () => {
    appServiceDs.query().then((data) => {
      if (data && data.length && data.length > 0) {
        selectAppDs.current.set('appServiceId', selectAppDs.current.get('appServiceId') || data[0].id);
        handleRefresh();
      }
    });
  };
  return type && type === 'button' ? [
    getSelfToolBar(),
    <Button
      onClick={refreshApp}
      icon="refresh"
    >
      {formatMessage({ id: 'boot.refresh' })}
    </Button>,
  ] : (
    <>
      <Header>
        <HeaderButtons
          items={(function () {
            const item = getSelfToolBarObj();
            const res = [{
              icon: 'refresh',
              display: true,
              handler: refreshApp,
              iconOnly: true,
            }];
            if (item) {
              return [{
                ...getSelfToolBarObj(),
              }, {
                icon: 'refresh',
                display: true,
                handler: refreshApp,
                iconOnly: true,
              }];
            }
            return res;
          }())}
          showClassName={false}
        />
      </Header>
    </>
  );
})));

export default CodeManagerToolBar;

export const SelectApp = injectIntl(inject('AppState')(observer((props) => {
  const format = useFormatMessage('c7ncd.codeManger');
  const codeManagerStore = useCodeManagerStore();
  const { appServiceDs, selectAppDs, projectId } = codeManagerStore;
  const { intl: { formatMessage }, theme4 } = props;
  const currentApp = _.find(appServiceDs.toData(), ['id', selectAppDs.current.get('appServiceId')]);
  const noRepoUrl = formatMessage({ id: 'repository.noUrl' });

  const handleCopy = () => { Choerodon.prompt('复制成功'); };
  const copyMenu = (
    <div role="none" className="c7ncd-copyMenu c7n-pro-form-float" onClick={(e) => e.stopPropagation()}>
      <Form>
        <TextField
          disabled
          defaultValue={(currentApp && currentApp.sshRepositoryUrl) || noRepoUrl}
          label={formatMessage({ id: 'repository.SSHaddress' })}
          addonAfter={(
            <CopyToClipboard
              text={(currentApp && currentApp.sshRepositoryUrl) || noRepoUrl}
              onCopy={handleCopy}
            >
              <Icon type="content_copy" style={{ cursor: 'pointer', color: '#5365ea' }} />
            </CopyToClipboard>
          )}
        />
        <TextField
          disabled
          defaultValue={(currentApp && currentApp.repoUrl) || noRepoUrl}
          label={formatMessage({ id: 'repository.HTTPSaddress' })}
          addonAfter={(
            <CopyToClipboard
              text={(currentApp && currentApp.repoUrl) || noRepoUrl}
              onCopy={handleCopy}
            >
              <Icon type="content_copy" style={{ cursor: 'pointer', color: '#5365ea' }} />
            </CopyToClipboard>
          )}
        />
      </Form>
    </div>
  );

  function rendererAppServiceId({ value, text }) {
    let newValue = value;
    if (newValue.includes('recent')) {
      newValue = newValue.replace('-recent', '');
    }
    const record = appServiceDs.find((appServiceRecord) => appServiceRecord.get('id') === newValue);
    try {
      return `${text}(${record.get('code')})`;
    } catch (e) {
      return text;
    }
  }
  const renderAppServiceOption = ({ value, text }) => {
    let newValue = value;
    if (newValue.includes('recent')) {
      newValue = newValue.replace('-recent', '');
    }
    const record = appServiceDs.find((appServiceRecord) => appServiceRecord.get('id') === newValue);
    if (record) {
      return (
        <Tooltip title={record.get('externalConfigId') ? '外置GitLab代码仓库的应用服务不支持代码管理功能' : record.get('code')}>
          {rendererAppServiceId({ value, text })}
        </Tooltip>
      );
    }
    return '';
  };

  const renderSearchMatcher = ({ record, text }) => {
    const tempRecord = appServiceDs.find((appServiceRecord) => appServiceRecord.get('id') === record.get('value'));
    return tempRecord?.get('code')?.indexOf(text) !== -1 || tempRecord?.get('name')?.indexOf(text) !== -1;
  };

  return (
    <div style={{ paddingLeft: 24, display: 'flex', alignItems: 'center' }}>
      <Form
        {
        ...theme4 ? {
          labelLayout: 'horizontal',
        } : {
          labelLayout: 'float',
        }
        }
        columns={2}
        style={{ maxWidth: '5.5rem' }}
      >
        <Select
          addonBefore={theme4 ? format({ id: 'ApplicationService' }) : undefined}
          colSpan={1}
          className="c7ncd-cm-select"
          label={theme4 ? undefined : formatMessage({ id: 'c7ncd.deployment.app-service' })}
          dataSet={selectAppDs}
          notFoundContent={appServiceDs.length === 0 ? formatMessage({ id: 'ist.noApp' }) : '未找到应用服务'}
          searchable
          searchMatcher={renderSearchMatcher}
          name="appServiceId"
          clearButton={false}
          disabled={appServiceDs.status !== 'ready' || appServiceDs.length === 0}
          optionRenderer={renderAppServiceOption}
          renderer={({ text }) => text}
        >
          {
            localStorage.getItem('recent-app') && (
            <OptGroup label={formatMessage({ id: 'deploy.app-recent' })} key="app-recent">
              {
                _.map(JSON.parse(localStorage.getItem('recent-app'))[projectId], ({
                  id, code, externalConfigId, name: opName,
                }, index) => (
                  <Option
                    value={`${id}-recent`}
                    key={`${index}-recent`}
                    disabled={Boolean(externalConfigId)}
                  >
                    {opName}
                  </Option>
                ))
              }
            </OptGroup>
            )
          }

          <OptGroup label={formatMessage({ id: 'deploy.app' })} key="app">
            {
            _.map(appServiceDs.toData(), ({
              id, code, externalConfigId, name: opName,
            }, index) => (
              <Option
                value={`${id}`}
                key={`${index}-app`}
                disabled={Boolean(externalConfigId)}
              >
                {opName}
              </Option>
            ))
          }
          </OptGroup>

        </Select>
        <div style={{ marginLeft: 10 }}>
          <ButtonGroup
            disabled={appServiceDs.length === 0}
            name={format({ id: 'CopyRepository' })}
            renderCustomDropDownPanel={(setvisib) => copyMenu}
          />
        </div>
      </Form>

    </div>
  );
})));
