import React from 'react';
import {
  TextField,
  Table,
} from 'choerodon-ui/pro';
import {
  Icon,
  Button,
} from 'choerodon-ui';
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
  } = useTimeTriggerStore();

  const handleAddTrigger = () => {
    handleModal();
  };

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
        <Column name={mapping.branch.name} />
        <Column name={mapping.triggerWay.name} />
        <Column name={mapping.nextTime.name} />
        <Column name={mapping.updater.name} />
      </Table>
    </div>
  );
});

export default Index;
