import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import PipelineTableDataSet from './PipelineTableDataSet';
import PipelineDataSet from './PipelineDataSet';
import PipelineChartDataSet from './PipelineChartDataSet';
import useStore from './useStore';

const Store = createContext();

export function usePipelineTriggerNumberStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')(observer((props) => {
    const {
      intl: { formatMessage },
      children,
    } = props;

    const prefixCls = 'c7ncd-pipelineTriggerNumber';

    const mainStore = useStore();

    const pipelineSelectDs = useMemo(() => new DataSet(PipelineDataSet()), []);

    const pipelineChartDs = useMemo(() => new DataSet(PipelineChartDataSet()), []);
    const pipelineTableDs = useMemo(() => new DataSet(PipelineTableDataSet()), []);

    const value = {
      ...props,
      prefixCls,
      pipelineSelectDs,
      pipelineTableDs,
      pipelineChartDs,
      mainStore,
    };

    return <Store.Provider value={value}>{children}</Store.Provider>;
  })),
);
