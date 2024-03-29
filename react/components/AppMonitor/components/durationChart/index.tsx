import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { getNearlyDays } from '@choerodon/master';
import moment from 'moment';
import ChartHeader from '../chartHeader';
import './index.less';
import { formateTime } from '@/utils/formateTime';

const DurationChart = (props: any) => {
  const colors = ['rgba(250, 173, 20, 0.4)', 'rgba(247, 103, 118, 0.4) '];
  const { durationData, getCurrentDurationResult } = props;
  const prefixCls = 'c7ncd-app-center-appMonitor-durationChart';
  const [selectValue, setSelectValue] = useState(getNearlyDays(-6));
  const [selectDateValue, setSelectDateValue] = useState(getNearlyDays(-6));
  const getDurationOption = () => ({
    color: colors,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 19, 88, 0.85)',
      textStyle: {
        color: 'rgba(255, 255, 255, 1) ',
        fontSize: 13,
      },
      formatter(param: any) {
        return `问题类型：${param.data[2]}<br/>发生时间：${
          param.data[3]}<br/>解决时间：${param.data[4]}<br/>持续时长：${param.data[5]}`;
      },
    },
    xAxis: {
      type: 'time',
      scale: true,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.45)',
        },
      },
      name: '发生时间',
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
      scale: true,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.45)',
        },
      },
      axisTick: {
        show: false,
      },
      name: '时长（分钟）',
      nameTextStyle: {
        color: 'rgba(0, 0, 0, 0.85)',
        fontSize: '12',
        padding: [0, 0, 0, -40],
      },
    },
    toolbox: {
      feature: {
        dataZoom: {},
        brush: {
          type: [''],
        },
      },
      left: '80%',
      top: '8%',
    },
    brush: {
    },
    series: [
      {
        name: 'abnormal',
        symbolSize: 10,
        itemStyle: {
          borderColor: 'rgba(250, 173, 20, 1)',
          borderWidth: 1,
        },
        data: durationData.exceptionDurationList,
        type: 'scatter',
      },
      {
        symbolSize: 10,
        name: 'stop',
        data: durationData.downTimeDurationList,
        type: 'scatter',
        itemStyle: {
          borderColor: 'rgba(247, 103, 118, 1)',
          borderWidth: 1,
        },
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
    getCurrentDurationResult(paramData);
  };

  const handleDateChange = (value:any, oldValue:any) => {
    setSelectValue('nothing');
    setSelectDateValue(value);
    const paramData = { date: { startTime: moment(value.startTime).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(value.endTime).format('YYYY-MM-DD HH:mm:ss') } };
    getCurrentDurationResult(paramData);
  };
  return (
    <div className={`${prefixCls}-numberChart`}>
      <ChartHeader
        handleTabChange={handleTabChange}
        title="异常与停机持续时长图"
        tooltipText="该图表展示了当前应用在一段时间内出现的每一次异常与停机的持续时长。"
        selectedValue={selectValue}
        handleDateChange={handleDateChange}
        selectDateValue={selectDateValue}
      />
      <div className={`${prefixCls}-description`}>
        <div className={`${prefixCls}-description-title`}>
          <div className={`${prefixCls}-description-title-abnormal`}>
            异常总时长：
            <span className={`${prefixCls}-description-title-content`}>{formateTime(durationData.exceptionTotalDuration) || '-'}</span>
          </div>
          <div className={`${prefixCls}-description-title-stop`}>
            停机总时长：
            <span className={`${prefixCls}-description-title-content`}>{formateTime(durationData.downTimeTotalDuration) || '-'}</span>
          </div>
        </div>
        <div className={`${prefixCls}-description-image`}>
          <div className={`${prefixCls}-description-image-abnormal`} />
          <div className={`${prefixCls}-description-abnormal`}>异常</div>
          <div className={`${prefixCls}-description-image-stop`} />
          <div className={`${prefixCls}-description-stop`}>停机</div>
        </div>

      </div>
      <ReactEcharts
        option={getDurationOption()}
        notMerge
        lazyUpdate
      />
    </div>
  );
};
export default observer(DurationChart);
