import React, { createContext, useContext, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import PipelineTableDataSet from './PipelineTableDataSet';
import PipelineDataSet from './PipelineDataSet';

const Store = createContext();

export function usePipelineTriggerNumberStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')((props) => {
    const {
      intl: { formatMessage },
      children,
    } = props;

    const prefixCls = 'c7ncd-pipelineTriggerNumber';

    const pipelineDs = useMemo(() => new DataSet(PipelineDataSet()), []);
    const pipelineTableDs = useMemo(() => new DataSet(PipelineTableDataSet()), []);

    const value = {
      ...props,
      prefixCls,
      pipelineDs,
      pipelineTableDs,
    };

    return <Store.Provider value={value}>{children}</Store.Provider>;
  }),
);
