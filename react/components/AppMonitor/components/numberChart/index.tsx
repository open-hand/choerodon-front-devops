import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { getNearlyDays } from '@choerodon/master';
import moment from 'moment';
import ChartHeader from '../chartHeader';
import './index.less';
import abnormalSvg from '@/images/abnormal.svg';
import stopSvg from '@/images/stop.svg';

const NumberChart = (props: any) => {
  const colors = ['#FAAD14 ', '#F76776 '];
  const { numberData, getCurrentNumberResult } = props;
  const prefixCls = 'c7ncd-app-center-appMonitor-numberChart';
  const [selectValue, setSelectValue] = useState(getNearlyDays(-6));
  const [selectDateValue, setSelectDateValue] = useState(getNearlyDays(-6));
  const renderXDate = () => {
    const res = numberData.dateList?.map((item:any) => {
      const newArray = item.split('-');
      newArray.splice(0, 1);
      return newArray.join('/');
    });
    return res;
  };
  const getNumberOption = () => ({
    color: colors,
    tooltip: {
      trigger: 'axis',
      formatter(param: any) {
        const res = numberData.dateList?.filter((item:any) => {
          const newArray = item.split('-');
          newArray.splice(0, 1);
          return newArray.join('/') === param[0].name;
        });
        return `日期：${res[0]?.split('-').join('/')}<br/>异常次数：${param[0].value}<br/>停机次数：${param[1].value}`;
      },
      backgroundColor: 'rgba(15, 19, 88, 0.85)',
      textStyle: {
        color: 'rgba(255, 255, 255, 1) ',
        fontSize: 13,
      },
    },
    xAxis: {
      type: 'category',
      data: renderXDate(),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.45)',
          width: '100%',
        },
      },
      name: '日期',
      nameTextStyle: {
        color: 'rgba(0, 0, 0, 0.85)',
        fontSize: '12',
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.45)',
        },
        show: false,
      },
      axisTick: {
        show: false,
      },
      name: '次数',
      nameTextStyle: {
        color: 'rgba(0, 0, 0, 0.85)',
        fontSize: '12',
        padding: [0, 0, 0, -40],
      },
    },
    series: [
      {
        name: 'abnormal',
        data: numberData.exceptionTimesList,
        type: 'line',
        symbol: 'circle',
        smooth: true,
      },
      {
        name: 'stop',
        data: numberData.downTimeList,
        type: 'line',
        symbol: 'circle',
        smooth: true,
      },
    ],
  });

  const handleTabChange = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string | number,
    value: any,
    number: number,
  ) => {
    setSelectValue(value);
    setSelectDateValue('');
    const paramData = { date: { startTime: moment(value).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') } };
    getCurrentNumberResult(paramData);
  };
  const handleDateChange = (value:any, oldValue:any) => {
    setSelectValue('nothing');
    setSelectDateValue(value);
    const paramData = { date: { startTime: moment(value.startTime).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(value.endTime).format('YYYY-MM-DD HH:mm:ss') } };
    getCurrentNumberResult(paramData);
  };
  return (
    <div className={`${prefixCls}-numberChart`}>
      <ChartHeader
        handleTabChange={handleTabChange}
        handleDateChange={handleDateChange}
        title="异常与停机次数图"
        selectedValue={selectValue}
        selectDateValue={selectDateValue}
        tooltipText={(
          <div>
            <div>该图表展示了当前应用在一段时间内出现异常与停机情况的次数。</div>
            <div>异常状态表示：Chart应用内，Deployment或StatefulSet中存在不是running状态的Pod；</div>
            <div>停机状态表示：Chart应用内，Deployment或StatefulSet中所有Pod都不是running状态。</div>
          </div>
)}
      />
      <div className={`${prefixCls}-description`}>
        <div className={`${prefixCls}-description-title`}>
          <div className={`${prefixCls}-description-title-abnormal`}>
            异常总次数：
            <span className={`${prefixCls}-description-title-content`}>{numberData.exceptionTotalTimes || '-'}</span>
          </div>
          <div className={`${prefixCls}-description-title-stop`}>
            停机总次数：
            <span className={`${prefixCls}-description-title-content`}>{numberData.downTimeTotalTimes || '-'}</span>
          </div>
        </div>
        <div className={`${prefixCls}-description-image`}>
          <img src={abnormalSvg} alt="" />
          <div className={`${prefixCls}-description-abnormal`}>异常</div>
          <img src={stopSvg} alt="" />
          <div className={`${prefixCls}-description-stop`}>停机</div>
        </div>
      </div>
      <ReactEcharts
        option={getNumberOption()}
        notMerge
        lazyUpdate
      />
    </div>
  );
};
export default observer(NumberChart);
