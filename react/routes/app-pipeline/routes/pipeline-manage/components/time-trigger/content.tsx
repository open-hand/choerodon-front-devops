import React, { useEffect, useState } from 'react';
import {
  TextField,
  Table,
} from 'choerodon-ui/pro';
import {
  Icon,
  Button,
} from 'choerodon-ui';
import {
  Action,
} from '@choerodon/master';
import {
  observer,
} from 'mobx-react-lite';
import {
  mapping,
} from './stores/timeTriggerDataSet';
import {
  handleModal,
} from './create-trigger';
import {
  useTimeTriggerStore,
} from './stores';

import './index.less';

const {
  Column,
} = Table;

const cssPrefix = 'c7ncd-timeTrigger';

const Index = observer(() => {
  const {
    TimeTriggerDataSet,
    projectId,
    appServiceId,
  } = useTimeTriggerStore();

  const refresh = () => {
    TimeTriggerDataSet?.query();
  };

  const handleAddTrigger = () => {
    handleModal(appServiceId, refresh);
  };

  const renderAction = ({ record }: any) => (
    <Action data={[{
      service: [],
      text: '修改',
      action: () => {},
    }, {
      service: [],
      text: '停用',
      action: () => {},
    }, {
      service: [],
      text: '删除',
      action: () => {},
    }]}
    />
  );

  return (
    <div className={cssPrefix}>
      <div className={`${cssPrefix}-title`}>
        <TextField
          placeholder="请输入搜索条件"
          prefix={<Icon type="search" />}
          className={`${cssPrefix}-title-textField`}
        />
        <Button
          funcType="flat"
          icon="playlist_add"
          onClick={handleAddTrigger}
        >
          添加定时触发任务
        </Button>
      </div>
      <Table
        queryBar={'none' as any}
        dataSet={TimeTriggerDataSet}
        className={`${cssPrefix}-table`}
      >
        <Column name={mapping.planName.name} />
        <Column
          width={55}
          renderer={renderAction}
        />
        <Column name={mapping.branch.name} />
        <Column name={mapping.triggerWay.name} />
        <Column name={mapping.nextTime.name} />
        <Column name={mapping.updater.name} />
      </Table>
    </div>
  );
});

export default Index;
