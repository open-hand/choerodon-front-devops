import React, { useEffect } from 'react';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import { Button } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import ChartSwitch from '../Component/ChartSwitch';
import { usePipelineTriggerNumberStore } from './stores';

import './index.less';

const PipelineTriggerNumber = () => {
  const {
    intl: { formatMessage },
    history,
    history: { location: { state, search } },
    prefixCls,
  } = usePipelineTriggerNumberStore();

  useEffect(() => {

  }, []);

  const handleRefresh = () => {

  };

  return (
    <Page
      className={prefixCls}
      service={[]}
    >
      <Header
        title={formatMessage({ id: 'report.pipelineTrigger-number.head' })}
        backPath={`/charts${search}`}
      >
        <ChartSwitch
          history={history}
          current="pipelineTrigger-number"
        />
        <Button
          icon="refresh"
          onClick={handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Breadcrumb title={formatMessage({ id: 'report.pipelineTrigger-number.head' })} />
      <Content className={`${prefixCls}-content`}>
        {/* {isRefresh ? <LoadingBar display={isRefresh} /> : content} */}
        shit
      </Content>
    </Page>
  );
};

export default PipelineTriggerNumber;
