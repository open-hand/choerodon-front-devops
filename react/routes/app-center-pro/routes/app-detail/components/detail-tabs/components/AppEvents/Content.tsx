import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Icon,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import _ from 'lodash';
import { Loading } from '@choerodon/components';
import Operation from './components/op-record';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './index.less';
import InstanceEvent from './components/intance-event';
import { useAppEventStore } from './stores';
import { useAppDetailTabsStore } from '../../stores';
import TabEmptyPage from '../TabEmptyPage';

const Cases = observer(() => {
  const {
    appEventsDs,
  } = useAppDetailTabsStore();

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useAppEventStore();

  const [currentCommandId, setCurrentCommandId] = useState(null);
  const [expandKeys, setExpandKeys] = useState([]);
  const [ignore, setIgnore] = useState(false);
  const loading = appEventsDs.status === 'loading';

  function changeEvent(data:any, isIgnore:any) {
    setCurrentCommandId(data);
    setIgnore(isIgnore);
  }

  /**
   * 展开更多
   * @param item
   */
  function showMore(item:any) {
    const data:any = [...expandKeys];
    const flag = _.includes(data, item);
    if (flag) {
      const index = _.indexOf(data, item);
      data.splice(index, 1);
    } else {
      data.push(item);
    }
    setExpandKeys(data);
  }

  function istEventDom(data:any) {
    if (ignore) {
      return (
        <div className={`${prefixCls}-instance-cases-empty`}>
          {formatMessage({ id: `${intlPrefix}.instance.cases.ignore` })}
        </div>
      );
    }

    const podEventVO = data.get('podEventVO');
    const events = _.map(podEventVO, ({
      name, log, event, jobPodStatus,
    }: {
      name: string,
      log: string,
      event: string,
      jobPodStatus: string
    }, index:number) => {
      const flag = _.includes(expandKeys, `${index}-${name}`);
      const eventData = {
        index, jobPodStatus, name, log, flag, event, intlPrefix, formatMessage, showMore,
      };
      return <InstanceEvent {...eventData} />;
    });

    return events.length ? events : (
      <div className={`${prefixCls}-instance-cases-empty`}>
        {formatMessage({ id: `${intlPrefix}.instance.cases.none` })}
      </div>
    );
  }

  function getContent() {
    const record = appEventsDs.data;
    if (record.length) {
      const currentPod = appEventsDs.find((data:any) => {
        const commandId = data.get('commandId');
        return commandId === currentCommandId;
      });
      const data = currentPod || appEventsDs.get(0);
      return (
        <>
          <Operation
            handleClick={changeEvent}
            active={currentCommandId}
          />
          <div className="cases-operation-content">
            <div className="case-operation-main">
              {istEventDom(data)}
            </div>
          </div>
        </>
      );
    }
    return (
      <TabEmptyPage text={formatMessage({ id: `${intlPrefix}.instance.cases.empty` })} />
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`${prefixCls}-instance-cases`}>
      {getContent()}
    </div>
  );
});

export default Cases;
