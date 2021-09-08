/* eslint-disable jsx-a11y/click-events-have-key-events,max-len, jsx-a11y/no-static-element-interactions */

import React, {
  Fragment, useEffect, useState, useMemo,
} from 'react';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { NewTips as Tips } from '@choerodon/components';
import YamlEditor from '@/components/yamlEditor';
import StatusDot from '@/components/status-dot';
import NetworkForm from './components/NetworkForm';
import DomainForm from './components/DomianForm';
import { useBatchDeployStore } from './stores';
import { Record } from '@/interface';

import './index.less';

const { Option, OptGroup } = Select;

const BatchDeployModal = injectIntl(observer(() => {
  const {
    batchDeployDs,
    deployStore,
    refresh,
    intlPrefix,
    prefixCls,
    modal,
    formatMessage,
    envId,
  } = useBatchDeployStore();

  const record = useMemo(() => batchDeployDs.current, [batchDeployDs.current]);

  const [hasYamlFailed, setHasYamlFailed] = useState(false);
  const [resourceIsExpand, setResourceIsExpand] = useState(false);
  const [netIsExpand, setNetIsExpand] = useState(true);
  const [ingressIsExpand, setIngressIsExpand] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (envId) {
      record?.init('environmentId', envId);
    }
  }, [envId]);

  modal.handleOk(async () => {
    if (hasYamlFailed) return false;
    try {
      let hasError = false;
      batchDeployDs.forEach(async (eachRecord) => {
        const result = await eachRecord.validate();
        if (!result) {
          hasError = true;
        }
        eachRecord.set('hasError', !result);
      });
      if (hasError) {
        setShowError(true);
        return false;
      }
      const res = await batchDeployDs.submit();
      if (res !== false) {
        refresh(res.list ? res.list[0] : {}, 'resource');
        return true;
      }
      setShowError(true);
      return false;
    } catch (e) {
      return false;
    }
  });

  function ChangeConfigValue(value: any) {
    record?.set('values', value);
  }

  function handleEnableNext(flag: boolean | ((prevState: boolean) => boolean)) {
    setHasYamlFailed(flag);
  }

  function renderEnvOption({ record: envRecord, text, value }:any) {
    return (
      <>
        {value && (
        <StatusDot
          // @ts-expect-error
          connect={envRecord.get('connect') as any}
          synchronize={envRecord.get('synchro')}
          active={envRecord.get('active')}
          size="small"
        />
        )}
        <span className={`${prefixCls}-select-option-text`}>{text}</span>
      </>
    );
  }

  function renderOptionProperty({ record: envRecord }:any) {
    const isAvailable = envRecord.get('connect') && envRecord.get('synchro') && envRecord.get('permission');
    return ({
      disabled: !isAvailable,
    });
  }

  function handleExpand(Operating: { (value: React.SetStateAction<boolean>): void; (value: React.SetStateAction<boolean>): void; (value: React.SetStateAction<boolean>): void; (arg0: (pre: any) => boolean): void; }) {
    Operating((pre: any) => !pre);
  }

  function handleRemoveForm(formRecord: Record | Record[] | undefined) {
    batchDeployDs.remove(formRecord as any);
  }

  function handleAddForm(appServiceType: string) {
    batchDeployDs.create();
    batchDeployDs.current?.init('appServiceSource', appServiceType);
    deployStore.setConfigValue('');
  }

  function handleClickAppService(formRecord: any) {
    batchDeployDs.current = formRecord;
  }

  return (
    <div className={`${prefixCls}-batch-deploy`}>
      {!envId && (
      <Form record={batchDeployDs.current} columns={2}>
        <Select
          name="environmentId"
          searchable
          clearButton={false}
          optionRenderer={renderEnvOption}
          notFoundContent={<FormattedMessage id={`${intlPrefix}.env.empty`} />}
          onOption={renderOptionProperty}
        />
        {/* @ts-expect-error */}
        <span colSpan={1} />
      </Form>
      )}
      <div className={`${prefixCls}-batch-deploy-content`}>
        <div className={`${prefixCls}-batch-deploy-content-app`}>
          {map(batchDeployDs.data, (formRecord) => {
            if (formRecord.get('appServiceSource') === 'normal_service') {
              return (
                <div
                  className={`${prefixCls}-batch-deploy-content-app-item ${batchDeployDs.current === formRecord ? `${prefixCls}-batch-deploy-content-app-active` : ''}`}
                  key={formRecord.id}
                >
                  <Form record={formRecord} columns={8}>
                    <Select
                      name="appServiceId"
                      searchable
                      colSpan={6}
                      notFoundContent={<FormattedMessage id={`${intlPrefix}.app.empty`} />}
                      onClick={() => handleClickAppService(formRecord)}
                    >
                      {map(deployStore.getAppService[0] && deployStore.getAppService[0].appServiceList,
                        ({ id, name, code }) => (
                          <Option value={`${id}**${code}`} key={id}>{name}</Option>
                        ))}
                    </Select>
                    {batchDeployDs.data.length > 1 ? (
                      <Button
                        funcType={'flat' as any}
                        icon="delete"
                        // @ts-expect-error
                        colSpan={1}
                        className="appService-delete-btn"
                        onClick={() => handleRemoveForm(formRecord as any)}
                      />
                      // @ts-expect-error
                    ) : <span colSpan={1} />}
                    {formRecord.get('hasError') ? (
                      // @ts-expect-error
                      <Icon type="error" colSpan={1} className="appService-error-icon" />
                      // @ts-expect-error
                    ) : <span colSpan={1} />}
                  </Form>
                </div>
              );
            }
            return null;
          })}
          <Button
            funcType={'flat' as any}
            color={'primary' as any}
            icon="add"
            className="appService-add-btn"
            onClick={() => handleAddForm('normal_service')}
            disabled={batchDeployDs.data.length >= 20}
          >
            {formatMessage({ id: `${intlPrefix}.add.appService.normal` })}
          </Button>
          {map(batchDeployDs.data, (formRecord) => {
            if (formRecord.get('appServiceSource') === 'share_service') {
              return (
                <div
                  className={`${prefixCls}-batch-deploy-content-app-item ${batchDeployDs.current === formRecord ? `${prefixCls}-batch-deploy-content-app-active` : ''}`}
                  key={formRecord.id}
                >
                  <Form record={formRecord} columns={8}>
                    <Select
                      name="appServiceId"
                      searchable
                      colSpan={6}
                      notFoundContent={<FormattedMessage id={`${intlPrefix}.app.empty`} />}
                      onClick={() => handleClickAppService(formRecord as any)}
                    >
                      {map(deployStore.getShareAppService, ({ id: groupId, name: groupName, appServiceList }) => (
                        <OptGroup label={groupName} key={groupId}>
                          {map(appServiceList, ({ id, name, code }) => (
                            <Option value={`${id}**${code}`} key={id}>{name}</Option>
                          ))}
                        </OptGroup>
                      ))}
                    </Select>
                    {batchDeployDs.data.length > 1 ? (
                      <Button
                        funcType={'flat' as any}
                        icon="delete"
                        // @ts-expect-error
                        colSpan={1}
                        className="appService-delete-btn"
                        onClick={() => handleRemoveForm(formRecord as any)}
                      />
                      // @ts-expect-error
                    ) : <span colSpan={1} />}
                    {formRecord.get('hasError') ? (
                      // @ts-expect-error
                      <Icon type="error" colSpan={1} className="appService-error-icon" />
                      // @ts-expect-error
                    ) : <span colSpan={1} />}
                  </Form>
                </div>
              );
            }
            return null;
          })}
          <Button
            funcType={'flat' as any}
            color={'primary' as any}
            icon="add"
            className="appService-add-btn"
            onClick={() => handleAddForm('share_service')}
            disabled={batchDeployDs.data.length >= 20}
          >
            {formatMessage({ id: `${intlPrefix}.add.appService.share` })}
          </Button>
          {showError && (
          <div className={`${prefixCls}-batch-deploy-error`}>
            {formatMessage({ id: `${intlPrefix}.batch.deploy.error` })}
          </div>
          )}
        </div>
        <div className={`${prefixCls}-batch-deploy-content-form`}>
          <Form record={batchDeployDs.current} columns={3}>
            <Select
              name="appServiceVersionId"
              searchable
              searchMatcher="version"
              colSpan={1}
              disabled={record && !record.get('appServiceId')}
            />
            <TextField
              name="appCode"
              colSpan={1}
              addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.instance.tips` })} />}
            />
            <TextField
              name="appName"
              colSpan={1}
            />
            <Select
              name="valueId"
              searchable
              colSpan={3}
              newLine
              clearButton
              disabled={record && (!record.get('appServiceId') || !record.get('environmentId'))}
              addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.config.tips` })} />}
              notFoundContent={<FormattedMessage id={`${intlPrefix}.config.empty`} />}
            />
            <YamlEditor
              colSpan={3}
              newLine
              readOnly={false}
              value={record ? record.get('values') || '' : ''}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
            />
          </Form>
          <div className={`${prefixCls}-resource-config`}>
            <div
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
        </div>
      </div>
    </div>
  );
}));

export default BatchDeployModal;
