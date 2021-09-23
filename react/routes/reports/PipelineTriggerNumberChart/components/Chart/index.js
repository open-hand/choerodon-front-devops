/* eslint-disable max-len */
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import { useReportsStore } from '@/routes/reports/stores';
import { usePipelineTriggerNumberStore } from '../../stores';
import mapings from '../../stores/mappings';
import { getAxis } from '../../../util';

const Chart = (props) => {
  const {
    intl: { formatMessage },
    history,
    history: { location: { state, search } },
    prefixCls,
    pipelineChartDs,
  } = usePipelineTriggerNumberStore();

  const {
    ReportsStore,
  } = useReportsStore();

  const startTime = ReportsStore.getStartTime;
  const endTime = ReportsStore.getEndTime;

  const getVal = (pipelineFailFrequency, pipelineSuccessFrequency) => [
    {
      name: `${formatMessage({ id: 'report.pipelineTrigger-number.fail' })}`,
      value: reduce(pipelineFailFrequency, (sum, n) => sum + n, 0),
    },
    {
      name: `${formatMessage({ id: 'report.pipelineTrigger-number.success' })}`,
      value: reduce(pipelineSuccessFrequency, (sum, n) => sum + n, 0),
    },
  ];

  const getTooltip = () => ({
    trigger: 'axis',
    axisPointer: {
      type: 'none',
    },
    backgroundColor: 'rgba(0,0,0,0.75)',
    textStyle: {
      color: '#fff',
    },
    extraCssText: '0px 2px 8px 0px rgba(0,0,0,0.12);padding:15px 17px',
    formatter(params) {
      if (params[0].value || params[1].value) {
        return `<div>
          <div>时间：${params[1].name}</div>
          <div><span class="c7ncd-echarts-tooltip" style="background-color:${params[0].color};"></span>${formatMessage({ id: 'report.pipelineTrigger-number.build' })}${params[0].seriesName}：${params[0].value}</div>
          <div><span class="c7ncd-echarts-tooltip" style="background-color:${params[1].color};"></span>${formatMessage({ id: 'report.pipelineTrigger-number.build' })}${params[1].seriesName}：${params[1].value}</div>
        <div>`;
      }
      return null;
    },
  });

  const getGrid = () => ({
    left: '2%',
    right: '3%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  });

  const getLegend = (pipelineSuccessFrequency, pipelineFailFrequency) => ({
    left: 'right',
    itemWidth: 14,
    itemGap: 20,
    padding: [0, 5, 5, 5],
    formatter(name) {
      let count = 0;
      map(getVal(pipelineFailFrequency, pipelineSuccessFrequency), (data) => {
        if (data.name === name) {
          count = data.value;
        }
      });
      return `${name}：${count}`;
    },
    selectedMode: false,
  });

  const getSeries = (yAxis) => [
    {
      name: `${formatMessage({ id: 'report.pipelineTrigger-number.success' })}`,
      type: 'bar',
      barWidth: '16px',
      itemStyle: {
        color: '#00BFA5',
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.20)',
        },
      },
      stack: 'success',
      data: yAxis.pipelineSuccessFrequency,
    },
    {
      name: `${formatMessage({ id: 'report.pipelineTrigger-number.fail' })}`,
      type: 'bar',
      barWidth: '16px',
      itemStyle: {
        color: '#FD729C',
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.20)',
        },
      },
      stack: 'fail',
      data: yAxis.pipelineFailFrequency,
    },
  ];

  const getYAxis = (yAxis) => ({
    name: `${formatMessage({ id: 'report.pipelineTrigger-number.yAxis' })}`,
    type: 'value',

    nameTextStyle: {
      fontSize: 13,
      color: '#000',
      padding: [0, 5, 2, 5],
    },
    axisTick: { show: false },
    axisLine: {
      lineStyle: {
        color: '#eee',
        type: 'solid',
        width: 2,
      },
    },

    axisLabel: {
      textStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 12,
      },
    },
    splitLine: {
      lineStyle: {
        color: '#eee',
        type: 'solid',
        width: 1,
      },
    },
    min: (yAxis.pipelineFrequencys && yAxis.pipelineFrequencys.length) ? null : 0,
    max: (yAxis.pipelineFrequencys && yAxis.pipelineFrequencys.length) ? null : 4,
  });

  const getXAxis = (xAxis) => ({
    type: 'category',
    axisTick: { show: false },
    axisLine: {
      lineStyle: {
        color: '#eee',
        type: 'solid',
        width: 2,
      },
    },

    axisLabel: {
      margin: 13,
      textStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 12,
      },
      formatter(value) {
        return `${value.substr(5).replace('-', '/')}`;
      },
    },
    splitLine: {
      lineStyle: {
        color: ['#eee'],
        width: 1,
        type: 'solid',
      },
    },
    data: xAxis,
  });

  const getOpts = () => {
    const {
      createDates, pipelineFrequencys, pipelineSuccessFrequency, pipelineFailFrequency,
    } = pipelineChartDs.current ? pipelineChartDs.current.toData() : {};

    const { xAxis, yAxis } = getAxis(startTime, endTime, createDates || [], { pipelineFailFrequency, pipelineSuccessFrequency, pipelineFrequencys });
    const option = {
      legend: getLegend(pipelineSuccessFrequency, pipelineFailFrequency),
      tooltip: getTooltip(),
      xAxis: getXAxis(xAxis),
      yAxis: getYAxis(yAxis),
      grid: getGrid(),
      series: getSeries(yAxis),
    };
    return option;
  };

  if (pipelineChartDs.status === 'loading') {
    return <Loading display type="c7n" />;
  }

  return (
    <ReactEcharts
      option={getOpts()}
    />
  );
};

export default observer(Chart);
