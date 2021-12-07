/* eslint-disable react/jsx-no-bind */
import React, {
  useMemo, useState, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Spin } from 'choerodon-ui/pro';
import { Choerodon, useFormatMessage } from '@choerodon/master';
import { Loading } from '@choerodon/components';
import EmptyPage from '@/components/empty-page';
import NumberDetail from './number-detail';
import CollapseDetail from './collapse-detail';
import { useResourceStore } from '../../../../../../../stores';
import { useInterval } from '@/components/costom-hooks';

import './index.less';
import { useREStore } from '../../../../stores';
import { ButtonColor, FuncType } from '@/interface';

const polaris = observer(() => {
  const {
    baseInfoDs,
    polarisNumDS,
    envStore,
    istSummaryDs,
  } = useREStore();

  const format = useFormatMessage('c7ncd.resource');

  const {
    resourceStore: { getSelectedMenu: { id } },
    prefixCls,
    intlPrefix,
    formatMessage,
    projectId,
  } = useResourceStore();

  const [loading, setLoading] = useState(false);
  const [delay, setDelay] = useState(0);

  const statusLoading = useMemo(() => polarisNumDS.current && polarisNumDS.current.get('status') === 'operating', [polarisNumDS.current]);

  useEffect(() => {
    if (statusLoading) {
      setDelay(5000);
    } else {
      setDelay(0);
    }
  }, [statusLoading]);

  useEffect(() => {
    setLoading(false);
  }, [polarisNumDS.current]);

  function handleScan() {
    envStore.ManualScan(projectId, id);
    setLoading(true);
    setDelay(5000);
  }

  async function loadData() {
    try {
      await polarisNumDS.query();
      if (polarisNumDS.current) {
        if (polarisNumDS.current.get('status') === 'operating') {
          setDelay(5000);
        } else {
          istSummaryDs.query();
          setDelay(0);
        }
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      setDelay(0);
    }
  }

  function getContent() {
    const isLoading = loading || statusLoading;
    const envStatus = baseInfoDs.current && baseInfoDs.current.get('connect');
    if (envStore.getPolarisLoading) {
      return <Loading display type="c7n" />;
    }
    if (envStore.getHasInstance) {
      return (
        <>
          <Button
            className={`${prefixCls}-polaris-wrap-btn`}
            color={'primary' as ButtonColor}
            funcType={'raised' as FuncType}
            onClick={handleScan}
            disabled={isLoading || !envStatus}
          >
            {format({ id: 'Scan' })}
          </Button>
          <NumberDetail isLoading={isLoading} />
          <CollapseDetail loading={isLoading} />
        </>
      );
    }
    return (
      <EmptyPage
        // @ts-expect-error
        title={formatMessage({ id: 'empty.title.instance' })}
        describe={formatMessage({ id: `${intlPrefix}.polaris.empty.des` })}
        access
      />
    );
  }

  useInterval(loadData, delay);

  if (polarisNumDS.status === 'sync') {
    return <Spin />;
  }

  return (
    <div className={`${prefixCls}-polaris-wrap`}>
      {getContent()}
    </div>
  );
});

export default polaris;
