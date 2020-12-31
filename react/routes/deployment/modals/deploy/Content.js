import React, {
  Fragment, useCallback, useEffect, useState,
} from 'react';
import {
  Button, Form, Icon, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import find from 'lodash/find';
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
  } = useManualDeployStore();

  const record = manualDeployDs.current;

  const [hasYamlFailed, setHasYamlFailed] = useState(false);
  const [resourceIsExpand, setResourceIsExpand] = useState(false);
  const [netIsExpand, setNetIsExpand] = useState(false);
  const [ingressIsExpand, setIngressIsExpand] = useState(false);

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

  function handleLinkToDetail() {
    const marketRecord = marketAndVersionOptionsDs.find((optionRecord) => optionRecord.get('id') === record.get('marketAppAndVersion'));
    if (marketRecord && marketRecord.get('marketAppId')) {
      history.push({
        pathname: '/market/app-market/app-detail',
        search,
        state: {
          appId: marketRecord.get('marketAppId'),
        },
      });
    }
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
            <SelectBox name="appServiceSource" colSpan={1}>
              <Option value="normal_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.project` })}
                </span>
              </Option>
              <Option value="share_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.organization` })}
                </span>
              </Option>
              <Option value="market_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.market` })}
                </span>
              </Option>
            </SelectBox>
            {record.get('appServiceSource') === 'market_service' ? ([
              <Select
                name="marketAppAndVersion"
                searchable
                newLine
              />,
              <Select
                name="marketService"
                disabled={!record.get('marketAppAndVersion')}
                searchable
              />,
              <Button
                className={`${prefixCls}-manual-deploy-market-btn`}
                disabled={!record.get('marketAppAndVersion')}
                onClick={handleLinkToDetail}
              >
                查看版本详情
              </Button>,
            ]) : ([
              <Select
                name="appServiceId"
                searchable
                newLine={record.get('appServiceSource') !== 'market_service'}
                notFoundContent={<FormattedMessage id={`${intlPrefix}.app.empty`} />}
              >
                {record.get('appServiceSource') === 'normal_service' ? (
                  map(deployStore.getAppService[0]
                    && deployStore.getAppService[0].appServiceList, ({ id, name, code }) => (
                      <Option value={`${id}**${code}`} key={id}>{name}</Option>
                  ))
                ) : (
                  map(deployStore.getAppService,
                    ({ id: groupId, name: groupName, appServiceList }) => (
                      <OptGroup label={groupName} key={groupId}>
                        {map(appServiceList, ({ id, name, code }) => (
                          <Option value={`${id}**${code}`} key={id}>{name}</Option>
                        ))}
                      </OptGroup>
                    ))
                )}
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
      ) : <HostDeployForm handleLinkToDetail={handleLinkToDetail} />);

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
