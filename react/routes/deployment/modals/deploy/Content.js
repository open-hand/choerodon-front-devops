import React, {
  Fragment, useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Button, Form, Icon, Select, SelectBox, TextField, Tooltip, Spin,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import get from 'lodash/get';
import { mapping } from '@/routes/deployment/modals/deploy/stores/ManualDeployDataSet';
import YamlEditor from '../../../../components/yamlEditor';
import StatusDot from '../../../../components/status-dot';
import Tips from '../../../../components/new-tips';
import NetworkForm from './NetworkForm';
import DomainForm from './DomainForm';
import HostDeployForm from './HostDeployForm';
import { useManualDeployStore } from './stores';

import './index.less';

const { Option, OptGroup } = Select;

const DeployModal = observer(() => {
  const {
    manualDeployDs,
    deployStore,
    refresh,
    intlPrefix,
    prefixCls,
    modal,
    intl: { formatMessage },
    envId,
    history,
    location: { search },
    marketAndVersionOptionsDs,
    hasDevops,
    hasMarket,
  } = useManualDeployStore();

  const record = manualDeployDs.current;

  const [hasYamlFailed, setHasYamlFailed] = useState(false);
  const [resourceIsExpand, setResourceIsExpand] = useState(false);
  const [netIsExpand, setNetIsExpand] = useState(true);
  const [ingressIsExpand, setIngressIsExpand] = useState(true);

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

  useEffect(() => {
    if (envId) {
      record.init('environmentId', envId);
    }
  }, [envId]);

  useEffect(() => {
    ChangeConfigValue(deployStore.getConfigValue);
  }, [deployStore.getConfigValue]);

  // eslint-disable-next-line consistent-return
  modal.handleOk(async () => {
    if (hasYamlFailed) return false;
    try {
      const res = await manualDeployDs.submit();
      if (res !== false) {
        refresh(res.list[0]);
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  });

  function ChangeConfigValue(value) {
    record.set('values', value);
  }

  function handleEnableNext(flag) {
    setHasYamlFailed(flag);
  }

  function renderEnvOption({ record: envRecord, text, value }) {
    return (
      <>
        {value && (
        <StatusDot
          connect={envRecord.get('connect')}
          synchronize={envRecord.get('synchro')}
          active={envRecord.get('active')}
          size="small"
        />
        )}
        <span className={`${prefixCls}-select-option-text`}>{text}</span>
      </>
    );
  }

  function renderOptionProperty({ record: envRecord }) {
    const isAvailable = envRecord.get('connect') && envRecord.get('synchro') && envRecord.get('permission');
    return ({
      disabled: !isAvailable,
    });
  }

  function handleExpand(Operating) {
    Operating((pre) => !pre);
  }

  function renderMarketApp({ value, text }) {
    if (value && value['group-0'] && value.meaning) {
      return `${value['group-0']}-${value.meaning}`;
    }
    return text;
  }

  function renderSearchMatcher({ record: eachRecord, text, textField }) {
    return eachRecord.get(textField)?.indexOf(text) !== -1 || (eachRecord.get('group-0') && eachRecord.get('group-0')?.indexOf(text) !== -1);
  }

  function getMarketItem(colSpan = 1) {
    const marketAppId = get(record.get('marketService'), 'marketAppId');
    const href = `${window.location.origin}/#/market/app-market/app-detail/${marketAppId}${search}`;
    return ([
      <Select
        name="marketAppAndVersion"
        searchable
        newLine
        colSpan={colSpan}
        renderer={renderMarketApp}
        searchMatcher={renderSearchMatcher}
        addonAfter={(
          <Tips
            helpText="此处会显示出应用市场中所有已上线的市场应用及其版本。"
          />
        )}
      >
        {getMarketAndVersionContent()}
      </Select>,
      <Select
        name="marketService"
        disabled={!record.get('marketAppAndVersion')}
        searchable
        colSpan={colSpan}
        addonAfter={(
          <Tips
            helpText={() => (
              <>
                <p> 此处会显示出所选市场应用版本中对应的所有发布了部署包的市场服务及其对应的版本。</p>
                <p>若想查看所选市场服务及版本中含有的应用服务信息，点击右侧的「查看版本详情」按钮跳转查看即可。</p>
              </>
            )}
          />
        )}
      />,
      <Button
        className={`${prefixCls}-manual-deploy-market-btn`}
        disabled={!record.get('marketService')}
      >
        {marketAppId ? (
          <a
            href={href}
            rel="nofollow me noopener noreferrer"
            target="_blank"
            className={`${prefixCls}-manual-deploy-market-btn-link`}
          >
            查看版本详情
          </a>
        ) : (
          <span>查看版本详情</span>
        )}
      </Button>,
    ]);
  }

  function getMarketAndVersionContent() {
    if (marketAndVersionOptionsDs.status === 'loading') {
      return optionLoading;
    }
    return (
      marketAndVersionOptionsDs.map((marketRecord) => (
        <OptGroup label={marketRecord.get('name')} key={marketRecord.get('id')}>
          {map(marketRecord.get('appVersionVOS') || [], (item) => (
            <Option value={item} key={item.id}>{item.versionNumber}</Option>
          ))}
        </OptGroup>
      ))
    );
  }

  function handleOptionProps({ record: optionRecord }) {
    return ({
      disabled: (optionRecord.get('value') === 'normal_service' && !hasDevops)
        || (optionRecord.get('value') === 'market_service' && !hasMarket),
    });
  }

  function getAppServiceOptions() {
    if (deployStore.getAppServiceLoading || !record) {
      return optionLoading;
    }
    return (record.get('appServiceSource') === 'normal_service' ? (
      map(deployStore.getAppService[0]
        && deployStore.getAppService[0].appServiceList, ({ id, name, code }) => (
          <Option value={`${id}**${code}`} key={id}>{`${name}(${code})`}</Option>
      ))
    ) : (
      map(deployStore.getAppService,
        ({ id: groupId, name: groupName, appServiceList }) => (
          <OptGroup label={groupName} key={groupId}>
            {map(appServiceList, ({ id, name, code }) => (
              <Option value={`${id}**${code}`} key={id}>{`${name}(${code})`}</Option>
            ))}
          </OptGroup>
        ))
    ));
  }

  const renderRestForm = () => (
    record.get(mapping.deployWay.value) === mapping.deployWay.options[0].value
      ? (
        <>
          <Tips
            helpText={formatMessage({ id: `${intlPrefix}.source.tips` })}
            title={formatMessage({ id: `${intlPrefix}.source` })}
          />
          <Form record={record} columns={3}>
            <SelectBox name="appServiceSource" colSpan={1} onOption={handleOptionProps}>
              <Option value="normal_service">
                <Tooltip title={hasDevops ? '' : '仅【DevOps流程】项目类型支持部署本项目应用服务'}>
                  <span className={`${prefixCls}-manual-deploy-radio`}>
                    {formatMessage({ id: `${intlPrefix}.source.project` })}
                  </span>
                </Tooltip>
              </Option>
              <Option value="share_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.organization` })}
                </span>
              </Option>
              <Option value="market_service">
                <Tooltip title={hasMarket ? '' : '未安装【应用市场】插件，无法使用此功能'}>
                  <span className={`${prefixCls}-manual-deploy-radio`}>
                    {formatMessage({ id: `${intlPrefix}.source.market` })}
                  </span>
                </Tooltip>
              </Option>
            </SelectBox>
            {record.get('appServiceSource') === 'market_service' ? (getMarketItem()) : ([
              <Select
                name="appServiceId"
                searchable
                newLine={record.get('appServiceSource') !== 'market_service'}
                notFoundContent={<FormattedMessage id={`${intlPrefix}.app.empty`} />}
                searchMatcher={renderSearchMatcher}
              >
                {getAppServiceOptions()}
              </Select>,
              <Select
                name="appServiceVersionId"
                searchable
                searchMatcher="version"
                disabled={!record.get('appServiceId')}
              />,
            ])}
            {!envId
              ? (
                <Select
                  name="environmentId"
                  searchable
                  newLine
                  optionRenderer={renderEnvOption}
                  notFoundContent={<FormattedMessage id={`${intlPrefix}.env.empty`} />}
                  onOption={renderOptionProperty}
                />
              ) : null}
            <TextField
              name="instanceName"
              addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.instance.tips` })} />}
              colSpan={!envId ? 1 : 2}
              newLine={!!envId}
            />
            {record.get('appServiceSource') !== 'market_service' && (
              <Select
                name="valueId"
                searchable
                colSpan={2}
                newLine
                clearButton
                addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.config.tips` })} />}
                notFoundContent={<FormattedMessage id={`${intlPrefix}.config.empty`} />}
              />
            )}
            <YamlEditor
              colSpan={3}
              newLine
              readOnly={false}
              originValue={deployStore.getConfigValue}
              value={record.get('values') || deployStore.getConfigValue}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
            />
          </Form>
          <div className={`${prefixCls}-resource-config`}>
            <div
              role="none"
              className={`${prefixCls}-resource-config-title`}
              onClick={() => handleExpand(setResourceIsExpand)}
            >
              <FormattedMessage id={`${intlPrefix}.resource`} />
              <Icon
                type={resourceIsExpand ? 'expand_less' : 'expand_more'}
                className={`${prefixCls}-resource-config-icon`}
              />
            </div>
            <div className={resourceIsExpand ? '' : `${prefixCls}-resource-display`}>
              <div
                role="none"
                className={`${prefixCls}-resource-config-network`}
                onClick={() => handleExpand(setNetIsExpand)}
              >
                <Icon
                  type={netIsExpand ? 'expand_less' : 'expand_more'}
                  className={`${prefixCls}-resource-config-network-icon`}
                />
                <FormattedMessage id={`${intlPrefix}.network`} />
              </div>
              <div className={netIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
                <NetworkForm />
              </div>
              <div
                role="none"
                className={`${prefixCls}-resource-config-network`}
                onClick={() => handleExpand(setIngressIsExpand)}
              >
                <Icon
                  type={ingressIsExpand ? 'expand_less' : 'expand_more'}
                  className={`${prefixCls}-resource-config-network-icon`}
                />
                <FormattedMessage id={`${intlPrefix}.ingress`} />
              </div>
              <div className={ingressIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
                <DomainForm />
              </div>
            </div>
          </div>
        </>
      ) : (
        <HostDeployForm
          getMarketItem={getMarketItem}
        />
      ));

  return (
    <div className={`${prefixCls}-manual-deploy`}>
      <Form record={record} columns={3}>
        <SelectBox colSpan={1} name={mapping.deployWay.value}>
          {mapping.deployWay.options.map((o) => (
            <Option value={o.value}>
              <span className={`${prefixCls}-manual-deploy-radio`}>
                {o.label}
              </span>
            </Option>
          ))}
        </SelectBox>
      </Form>
      {
        renderRestForm()
      }
    </div>
  );
});

export default DeployModal;
