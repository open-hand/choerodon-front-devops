/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { DataSet as DataSetProps } from '@/interface';
import TableDataSet from './TableDataSet';
import SelectDataSet from './SelectDataSet';
import ChartDataSet from './ChartDataSet';
import { useReportsStore } from '../../stores';
import PipelineOptionsDataSet from './PipelineOptionsDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  selectDs: DataSetProps,
  tableDs: DataSetProps,
  chartDs: DataSetProps,
  optionsDs: DataSetProps,
  history: any,
}

const Store = createContext({} as ContextProps);

export function usePipelineDurationStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')(observer((props: any) => {
    const {
      intl: { formatMessage },
      children,
      AppState: { currentMenuType: { projectId } },
    } = props;
    const { ReportsStore } = useReportsStore();

    const prefixCls = useMemo(() => 'c7ncd-report-pipeline-duration', []);
    const intlPrefix = useMemo(() => 'c7ncd.reports.pipeline.duration', []);

    const optionsDs = useMemo(() => new DataSet(PipelineOptionsDataSet({ projectId })), [projectId]);
    const chartDs = useMemo(() => new DataSet(ChartDataSet({ projectId })), [projectId]);
    const tableDs = useMemo(() => new DataSet(TableDataSet({ projectId, intlPrefix, formatMessage })), [projectId]);
    const selectDs = useMemo(() => new DataSet(SelectDataSet({
      ReportsStore, optionsDs, chartDs, tableDs, formatMessage,
    })), []);

    const value = {
      ...props,
      intlPrefix,
      prefixCls,
      selectDs,
      tableDs,
      chartDs,
      optionsDs,
      formatMessage,
    };

    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  })),
);
