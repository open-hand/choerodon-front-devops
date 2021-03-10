/* eslint-disable max-len */
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import { forEach, map, get } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui/pro';
import getDuration from '@/utils/getDuration';
import { usePipelineDurationStore } from '../../stores';

interface SeriesObjectProps {
  name: string,
  symbolSize: number,
  itemStyle: {
    color: string,
    borderColor: string,
  },
  data: Array<string[]>,
  type: string,
}

interface LegendObjectProps {
  name: string,
  icon: string,
}

interface ExecuteObjectProps {
  pipelineName: string,
  executeDetailVOS: Array<DetailObjectProps | never>
}

interface DetailObjectProps {
  executeDate: string,
  executeTime: string,
}

const COLOR = ['50,198,222', '116,59,231', '87,170,248', '255,177,0', '237,74,103'];
const LEGEND = [
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI2IDI2Ij4KICA8Y2lyY2xlIGN4PSI0OTkiIGN5PSI2MiIgcj0iMTIiIGZpbGw9IiMzMkM2REUiIGZpbGwtb3BhY2l0eT0iLjYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjMzJDNkRFIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDg2IC00OSkiLz4KPC9zdmc+Cg==',
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI2IDI2Ij4KICA8Y2lyY2xlIGN4PSI0NDkiIGN5PSI1NyIgcj0iMTIiIGZpbGw9IiM3NDNCRTciIGZpbGwtb3BhY2l0eT0iLjYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjNzQzQkU3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDM2IC00NCkiLz4KPC9zdmc+Cg==',
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI2IDI2Ij4KICA8Y2lyY2xlIGN4PSI0OTkiIGN5PSI1NyIgcj0iMTIiIGZpbGw9IiM1N0FBRjgiIGZpbGwtb3BhY2l0eT0iLjYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjNTdBQUY4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDg2IC00NCkiLz4KPC9zdmc+Cg==',
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiI+CiAgPGRlZnM+CiAgICA8Y2lyY2xlIGlkPSI1LWEiIGN4PSI0OTkiIGN5PSI1NyIgcj0iMTIiLz4KICA8L2RlZnM+CiAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDg2IC00NCkiPgogICAgPHVzZSBmaWxsPSIjRkZCMTAwIiBmaWxsLW9wYWNpdHk9Ii42IiB4bGluazpocmVmPSIjNS1hIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6c2F0dXJhdGlvbiIvPgogICAgPHVzZSBzdHJva2U9IiNGRkIxMDAiIHhsaW5rOmhyZWY9IiM1LWEiLz4KICA8L2c+Cjwvc3ZnPgo=',
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI2IDI2Ij4KICA8Y2lyY2xlIGN4PSI0OTkiIGN5PSI1NyIgcj0iMTIiIGZpbGw9IiNFRDRBNjciIGZpbGwtb3BhY2l0eT0iLjYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjRUQ0QTY3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDg2IC00NCkiLz4KPC9zdmc+Cg==',
];

const Chart = () => {
  const {
    formatMessage,
    prefixCls,
    chartDs,
  } = usePipelineDurationStore();

  const getData = () => {
    if (!chartDs.current) {
      return null;
    }
    const res = chartDs.current.toData();
    if (res) {
      const { pipelineExecuteVOS } = res;
      const seriesArr: Array<SeriesObjectProps | never> = [];
      const legendArr: Array<LegendObjectProps | never> = [];
      forEach(pipelineExecuteVOS, (v: ExecuteObjectProps, index: number) => {
        const series = {
          name: get(v, 'pipelineName'),
          symbolSize: 24,
          itemStyle: {
            color: `rgba(${COLOR[index]}, 0.6)`,
            borderColor: `rgb(${COLOR[index]})`,
          },
          data: map(get(v, 'executeDetailVOS') || [], (c: object) => Object.values(c)),
          type: 'scatter',
        };
        seriesArr.push(series);
        legendArr.push({
          name: get(v, 'pipelineName'),
          icon: `image://${LEGEND[index]}`,
        });
      });
      return { legendArr, seriesArr };
    }
    return null;
  };

  const getOption = () => {
    const optionData = getData();
    return ({
      legend: {
        data: get(optionData, 'legendArr') || [],
        borderColor: '#000',
        borderWidth: '5px',
        itemWidth: 12,
        itemHeight: 12,
      },
      toolbox: {
        feature: {
          dataZoom: {},
          brush: {
            type: [''],
          },
        },
        right: '3%',
      },
      brush: {
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.75)',
        textStyle: {
          color: '#fff',
        },
        extraCssText: '0px 2px 8px 0px rgba(0,0,0,0.12);padding:15px 17px',
        formatter(params: any) {
          const time = getDuration({ value: params.value[1], unit: 'm' });
          return `<div>
                <div>${formatMessage({ id: 'branch.issue.date' })}：${params.value[0]}</div>
                <div>${get(params, 'marker')}<span>${get(params, 'seriesName')}：${time}</span></div>
              <div>`;
        },
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        scale: true,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisTick: { show: false },
        axisLabel: {
          margin: 13,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
        },
      },
      yAxis: {
        nameTextStyle: {
          fontSize: 13,
          color: '#000',
          padding: [0, 0, 0, 22],
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
          margin: 18,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            show: true,
            type: 'solid',
          },
        },
        boundaryGap: false,
        name: formatMessage({ id: 'minTime' }),
        min: get(get(optionData, 'legendArr'), 'length') && get(optionData, 'legendArr').length ? null : 0,
        max: get(optionData, 'legendArr') && get(optionData, 'legendArr').length ? null : 4,
        scale: true,
      },
      series: get(optionData, 'seriesArr') || [],
    });
  };

  return (
    <div className="c7n-report-content">
      <Spin spinning={chartDs.status === 'loading'}>
        <ReactEcharts
          option={getOption()}
          notMerge
          lazyUpdate
          style={{ height: '350px', width: '100%' }}
        />
      </Spin>
    </div>
  );
};

export default observer(Chart);
