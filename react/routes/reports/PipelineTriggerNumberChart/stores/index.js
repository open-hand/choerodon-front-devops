/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import PipelineTableDataSet from './PipelineTableDataSet';
import PipelineSelectDataSet from './PipelineSelectDataSet';
import PipelineChartDataSet from './PipelineChartDataSet';
import useStore from './useStore';
import { useReportsStore } from '../../stores';

const Store = createContext();

export function usePipelineTriggerNumberStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')(observer((props) => {
    const {
      intl: { formatMessage },
      children,
      AppState: { currentMenuType: { id: projectId } },
    } = props;

    const prefixCls = 'c7ncd-pipelineTriggerNumber';

    const { ReportsStore } = useReportsStore();

    const mainStore = useStore();

    const { selectedPipelineId } = mainStore;
    const { getStartTime, getEndTime } = ReportsStore;

    const pipelineSelectDs = useMemo(() => new DataSet(PipelineSelectDataSet({ projectId, ReportsStore, mainStore })), [projectId]);

    const pipelineChartDs = useMemo(() => new DataSet(PipelineChartDataSet({
      selectedPipelineId,
      projectId,
      startDate: getStartTime.format('YYYY-MM-DD HH:mm:ss'),
      endDate: getEndTime.format('YYYY-MM-DD HH:mm:ss'),
    })), [getEndTime, getStartTime, projectId, selectedPipelineId]);

    const pipelineTableDs = useMemo(() => new DataSet(PipelineTableDataSet({
      projectId,
      startDate: getStartTime.format('YYYY-MM-DD HH:mm:ss'),
      endDate: getEndTime.format('YYYY-MM-DD HH:mm:ss'),
      selectedPipelineId,
    })), [projectId, getStartTime, getEndTime, selectedPipelineId]);

    const value = {
      ...props,
      prefixCls,
      pipelineSelectDs,
      pipelineTableDs,
      pipelineChartDs,
      mainStore,
      formatMessage,
    };

    return <Store.Provider value={value}>{children}</Store.Provider>;
  })),
);
