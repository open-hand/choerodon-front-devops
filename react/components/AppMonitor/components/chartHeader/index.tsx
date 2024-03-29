import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  DatePicker,
} from 'choerodon-ui/pro';
import { CustomTabs, NewTips } from '@choerodon/components';
import './index.less';
import { getNearlyDays } from '@choerodon/master';

const ChartHeader = (props:any) => {
  const {
    handleTabChange, title, selectedValue, handleDateChange, selectDateValue, tooltipText,
  } = props;
  const prefixCls = 'c7ncd-app-center-appMonitor-chartHeader';
  const tabData = [
    {
      name: '近7天',
      value: getNearlyDays(-6),
    },
    {
      name: '近14天',
      value: getNearlyDays(-13),
    },
    {
      name: '近30天',
      value: getNearlyDays(-29),
    },
  ];

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-title`}>
        {title}
        <NewTips helpText={tooltipText} className={`${prefixCls}-title-tooltip`} />
      </div>
      <div className={`${prefixCls}-select`}>
        <CustomTabs className={selectedValue === 'nothing' ? `${prefixCls}-select-nothing-day` : `${prefixCls}-select-day`} data={tabData} selectedTabValue={selectedValue} onChange={handleTabChange} />
        <DatePicker className={`${prefixCls}-select-datePiker`} value={selectDateValue} onChange={handleDateChange} range={['startTime', 'endTime']} placeholder={['开始日期', '结束日期']} />
      </div>
    </div>
  );
};
export default observer(ChartHeader);
