import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { getNearlyDays } from '@choerodon/master';
import moment from 'moment';
import ChartHeader from '../chartHeader';
import './index.less';
import abnormalSvg from '@/images/abnormal.svg';
import stopSvg from '@/images/stop.svg';
import useStore from '../../useStore';

const NumberChart = (props: any) => {
  const colors = ['#FAAD14 ', '#F76776 '];
  const { appId } = props;
  const prefixCls = 'c7ncd-app-center-appMonitor-numberChart';
  const store = useStore();
  const [selectValue, setSelectValue] = useState(getNearlyDays(-6));
  const [selectDateValue, setSelectDateValue] = useState(getNearlyDays(-6));
  const renderXDate = () => {
    const res = store.getNumberData.dateList?.map((item:any) => {
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
        const res = store.getNumberData.dateList?.filter((item:any) => {
          const newArray = item.split('-');
          newArray.splice(0, 1);
          return newArray.join('/') === param[0].name;
        });
        return `日期：${res[0]?.split('-').join('/')}<br/>异常次数：${param[0].value}<br/>停机次数:${param[1].value}`;
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
        data: store.getNumberData.exceptionTimesList,
        type: 'line',
        symbol: 'circle',
        smooth: true,
      },
      {
        name: 'stop',
        data: store.getNumberData.downTimeList,
        type: 'line',
        symbol: 'circle',
        smooth: true,
      },
    ],
  });

  useEffect(() => {
    store.getNumberResult({
      appId,
      date: {
        startTime: moment(getNearlyDays(-6)).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      },
    });
  }, []);
  const handleTabChange = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string | number,
    value: any,
    number: number,
  ) => {
    setSelectValue(value);
    setSelectDateValue('');
    const paramData = { appId, date: { startTime: moment(value).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') } };
    store.getNumberResult(paramData);
  };
  const handleDateChange = (value:any, oldValue:any) => {
    setSelectValue('nothing');
    setSelectDateValue(value);
    const paramData = { appId, date: { startTime: moment(value.startTime).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(value.endTime).format('YYYY-MM-DD HH:mm:ss') } };
    store.getNumberResult(paramData);
  };
  return (
    <div className={`${prefixCls}-numberChart`}>
      <ChartHeader
        handleTabChange={handleTabChange}
        handleDateChange={handleDateChange}
        title="异常与停机次数图"
        selectedValue={selectValue}
        selectDateValue={selectDateValue}
      />
      <div className={`${prefixCls}-description`}>
        <div className={`${prefixCls}-description-title`}>
          <div className={`${prefixCls}-description-title-abnormal`}>
            异常总次数：
            <span className={`${prefixCls}-description-title-content`}>{store.getNumberData.exceptionTotalTimes}</span>
          </div>
          <div className={`${prefixCls}-description-title-stop`}>
            停机总次数：
            <span className={`${prefixCls}-description-title-content`}>{store.getNumberData.downTimeTotalTimes}</span>
          </div>
        </div>
        <div className={`${prefixCls}-description-image`}>
          {/* <div className={`${prefixCls}-description-image-abnormal`}>
              <div className={`${prefixCls}-description-image-abnormal-top`} style={{ borderRadius: '50% / 100% 100% 0 0' }} />
              <div className={`${prefixCls}-description-image-abnormal-top-inner`} style={{ borderRadius: '50% / 100% 100% 0 0' }} />
              <div className={`${prefixCls}-description-image-abnormal-bottom`} style={{ borderRadius: '0 0 100% 50% / 100%' }} />
              <div className={`${prefixCls}-description-image-abnormal-bottom-inner`} style={{ borderRadius: '0 0 100% 50% / 100%' }} />
            </div> */}
          <img src={abnormalSvg} alt="" />
          <div className={`${prefixCls}-description-abnormal`}>异常</div>

          {/* <div className={`${prefixCls}-description-image-stop`} style={{ borderRadius: '50% / 100% 100% 0 0' }}>
              <div className={`${prefixCls}-description-image-stop-top`} style={{ borderRadius: '50% / 100% 100% 0 0' }} />
              <div className={`${prefixCls}-description-image-stop-top-inner`} style={{ borderRadius: '0 0 100% 50% / 100%' }} />
              <div className={`${prefixCls}-description-image-stop-bottom`} style={{ borderRadius: '0 0 100% 50% / 100%' }} />
              <div className={`${prefixCls}-description-image-stop-bottom-inner`} style={{ borderRadius: '0 0 100% 50% / 100%' }} />
            </div> */}
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
