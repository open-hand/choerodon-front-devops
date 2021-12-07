/* eslint-disable */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import ReactEcharts from 'echarts-for-react';
import { useClusterStore } from '../../../stores';
import { useNodeContentStore } from './stores';
import NodePodsTable from './node-pods-table';
import { useClusterMainStore } from '../../stores';

import './NodeDetail.less';

const NodeContent = observer(() => {
  const {
    formatMessage,
    nodeInfoDs,
  } = useNodeContentStore();
  const {
    intlPrefix,
  } = useClusterMainStore();
  const { clusterStore: { getSelectedMenu } } = useClusterStore();
  const { name } = getSelectedMenu;

  const node = nodeInfoDs.current;

  return (
    <div className="c7ncd-node-content">
      {node ? (
        <>
          <div className="c7n-node-title">{formatMessage({ id: 'c7ncd-clusterManagement.DistributionOverview' })}</div>
          <div className="c7n-node-pie">
            {podPies(formatMessage, node.toData())}
          </div>
        </>
      ) : null}
      <div className="c7n-node-title">{formatMessage({ id: 'c7ncd-clusterManagement.NodePods' })}</div>
      <NodePodsTable />
    </div>
  );
});

function podPies(formatMessage, node) {
  if (!node) { return; }
  const cpuData = {
    rv: node.cpuRequest,
    lmv: node.cpuLimit,
    resPercent: node.cpuRequestPercentage,
    limPercent: node.cpuLimitPercentage,
    total: node.cpuTotal,
  };
  const memoryPieData = {
    rv: node.memoryRequestPercentage.split('%')[0],
    lmv: node.memoryLimitPercentage.split('%')[0],
    resPercent: node.memoryRequestPercentage,
    limPercent: node.memoryLimitPercentage,
    total: 100,
  };
  const memoryData = {
    rv: node.memoryRequest,
    lmv: node.memoryLimit,
    resPercent: node.memoryRequestPercentage,
    limPercent: node.memoryLimitPercentage,
    total: node.memoryTotal,
  };
  return (
    <>
      <div className="c7n-node-pie-block">
        <div className="c7n-node-pie-percent">
          {cpuData.resPercent}
        </div>
        <ReactEcharts
          option={getOption(cpuData)}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-inside-percent">
          {cpuData.limPercent}
        </div>
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'c7ncd-clusterManagement.CPUAllocation' })}
        </div>
        {pieDes(formatMessage, cpuData)}
      </div>
      <div className="c7n-node-pie-block">
        <div className="c7n-node-pie-percent">
          {memoryData.resPercent}
        </div>
        <ReactEcharts
          option={getOption(memoryPieData)}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-inside-percent">
          {memoryData.limPercent}
        </div>
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'c7ncd-clusterManagement.MemoryAllocation' })}
        </div>
        {pieDes(formatMessage, memoryData)}
      </div>
      <div className="c7n-node-pie-block">
        <div className="c7n-node-pie-percent" />
        <ReactEcharts
          option={getPodOption(node)}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-pod-percent">
          {node.podPercentage}
        </div>
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'c7ncd-clusterManagement.PodsAllocation' })}
        </div>
        <div className="c7n-node-pie-info">
          <span className="c7n-node-pie-info-span rv" />
          <span>{formatMessage({ id: 'node.allocated' })}</span>
          <span>{node.podCount}</span>
        </div>
        <div className="c7n-node-pie-info">
          <span className="c7n-node-pie-info-span" />
          <span>{formatMessage({ id: 'c7ncd-clusterManagement.Total' })}</span>
          <span>{node.podTotal}</span>
        </div>
      </div>
    </>
  );
}

function getOption(data) {
  const lmvSeries = data.total - data.lmv > 0 ? {
    type: 'pie',
    radius: ['40%', '68%'],
    hoverAnimation: false,
    label: { show: false },
    data: [
      {
        value: data.lmv,
        name: 'limitValue',
        itemStyle: { color: '#57AAF8' },
      },
      { value: data.total - data.lmv, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' } },
    ],
  } : {
    type: 'pie',
    radius: ['40%', '68%'],
    hoverAnimation: false,
    label: { show: false },
    data: [
      {
        value: data.lmv,
        name: 'limitValue',
        itemStyle: { color: '#57AAF8' },
      },
    ],
  };
  const rvSeries = data.total - data.rv > 0 ? {
    hoverAnimation: false,
    type: 'pie',
    radius: ['75%', '95%'],
    label: { show: false },
    data: [
      {
        value: data.rv,
        name: 'requestValue',
        itemStyle: { color: '#00BFA5' },
      },
      { value: data.total - data.rv, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' } },
    ],
  } : {
    type: 'pie',
    radius: ['75%', '95%'],
    hoverAnimation: false,
    label: { show: false },
    data: [
      {
        value: data.rv,
        name: 'limitValue',
        itemStyle: { color: '#00BFA5' },
      },
    ],
  };
  return {
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    series: [
      lmvSeries,
      rvSeries,
    ],
  };
}

function pieDes(formatMessage, data) {
  return (
    <>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span rv" />
        <span>{formatMessage({ id: 'c7ncd-clusterManagement.RequestValue' })}</span>
        <span>{data.rv}</span>
      </div>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span lmv" />
        <span>{formatMessage({ id: 'c7ncd-clusterManagement.LimitValue' })}</span>
        <span>{data.lmv}</span>
      </div>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span" />
        <span>{formatMessage({ id: 'c7ncd-clusterManagement.Total' })}</span>
        <span>{data.total}</span>
      </div>
    </>
  );
}

function getPodOption(node) {
  return {
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    series: [
      {
        hoverAnimation: false,
        type: 'pie',
        radius: ['75%', '95%'],
        label: { show: false },
        data: [
          {
            value: node.podCount,
            name: 'requestValue',
            itemStyle: { color: '#00BFA5' },
          },
          { value: node.podTotal, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' } },
        ],
      },
    ],
  };
}

export default NodeContent;
