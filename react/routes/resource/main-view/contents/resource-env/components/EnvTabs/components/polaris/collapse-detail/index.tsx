import React, {
  useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import { Collapse, Icon } from 'choerodon-ui';
import { useREStore } from '../../../../../stores';
import { useResourceStore } from '../../../../../../../../stores';
import { Record } from '@/interface';

import './index.less';

const { Panel } = Collapse;

const collapseDetail = observer(({ loading }:{
  loading:boolean
}) => {
  const {
    prefixCls,
    formatMessage,
    intlPrefix,
  } = useResourceStore();
  const {
    istSummaryDs,
  } = useREStore();

  const isLoading = useMemo(() => loading || istSummaryDs.status === 'loading', [loading, istSummaryDs.status]);

  function getIstHeader(record:Record) {
    const { instanceCode, appServiceName, hasErrors } = record.toData() || {};
    return (
      <div className={`${prefixCls}-polaris-tabs-header`}>
        <div className={`${prefixCls}-polaris-tabs-header-item`}>
          <span className={`${prefixCls}-polaris-tabs-header-text`}>
            {formatMessage({ id: 'instance' })}
            :
          </span>
          <span>{instanceCode}</span>
          {!isLoading && hasErrors && <Icon type="cancel" className={`${prefixCls}-polaris-tabs-header-error`} />}
        </div>
        <div className={`${prefixCls}-polaris-tabs-header-item`}>
          <span className={`${prefixCls}-polaris-tabs-header-text`}>
            {formatMessage({ id: 'appService' })}
            :
          </span>
          <span>{appServiceName}</span>
        </div>
      </div>
    );
  }

  function getIstContent(record:Record) {
    const checked = record.get('checked');
    const items = record.get('items');
    if (isLoading) {
      return <span className={`${prefixCls}-polaris-tabs-content`}>{formatMessage({ id: 'c7ncd.cluster.polaris.check.operating' })}</span>;
    }
    if (!checked) {
      return <span className={`${prefixCls}-polaris-tabs-content`}>{formatMessage({ id: 'c7ncd.cluster.polaris.check.null' })}</span>;
    }
    if (isEmpty(items)) {
      return <span className={`${prefixCls}-polaris-tabs-content`}>{formatMessage({ id: `${intlPrefix}.polaris.check.empty` })}</span>;
    }
    return (map(items, ({
      hasErrors, kind, name, podResult,
    }, index) => {
      const containers = podResult ? podResult.containerResults : [];
      const results = podResult ? podResult.results : {};
      return (
        <div key={`${name}-${index}`} className={`${prefixCls}-polaris-tabs-content`}>
          <div className={`${prefixCls}-polaris-tabs-content-title-weight`}>
            <span>{`${kind}: ${name}`}</span>
            {hasErrors && <Icon type="cancel" className={`${prefixCls}-polaris-tabs-header-error`} />}
          </div>
          <div className={`${prefixCls}-polaris-tabs-content-title`}>
            <span>Pod Spec:</span>
          </div>
          {isEmpty(results) ? (
            <div className={`${prefixCls}-polaris-tabs-content-env`}>
              <Icon type="done" className={`${prefixCls}-polaris-tabs-content-icon-success`} />
              <span>{formatMessage({ id: 'c7ncd.cluster.polaris.check.success' })}</span>
            </div>
          ) : (map(results, ({ message, type, severity }, resultIndex) => (
            <div key={`${type}-${resultIndex}`} className={`${prefixCls}-polaris-tabs-content-des`}>
              <Icon type={severity === 'warning' ? 'priority_high' : 'close'} className={`${prefixCls}-polaris-tabs-content-icon-${severity}`} />
              <span>{message}</span>
            </div>
          )))}
          {map(containers, ({ name: containerName, results: containerResults }) => (
            <>
              <div className={`${prefixCls}-polaris-tabs-content-title`} key={containerName}>
                <span>{`Container: ${containerName}`}</span>
              </div>
              {isEmpty(containerResults) ? (
                <div className={`${prefixCls}-polaris-tabs-content-env`}>
                  <Icon type="done" className={`${prefixCls}-polaris-tabs-content-icon-success`} />
                  <span>{formatMessage({ id: 'c7ncd.cluster.polaris.check.success' })}</span>
                </div>
              ) : (map(containerResults, ({ message, type, severity }, containerIndex) => (
                <div key={`${type}-${containerIndex}`} className={`${prefixCls}-polaris-tabs-content-des`}>
                  <Icon type={severity === 'warning' ? 'priority_high' : 'close'} className={`${prefixCls}-polaris-tabs-content-icon-${severity}`} />
                  <span>{message}</span>
                </div>
              )))}
            </>
          ))}
        </div>
      );
    }));
  }

  return (
    <div className={`${prefixCls}-polaris-tabs`}>
      <Collapse bordered={false}>
        {map(istSummaryDs.data, (istRecord) => (
          <Panel header={getIstHeader(istRecord)} key={istRecord.id}>
            {getIstContent(istRecord)}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
});

export default collapseDetail;
