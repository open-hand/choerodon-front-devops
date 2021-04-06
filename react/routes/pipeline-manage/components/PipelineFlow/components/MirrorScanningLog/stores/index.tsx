/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router';
import TableDataset from './TableDataset';
import DetailDataSet from './DetailsDataSet';

const Store = createContext({} as any);

export function useMirrorScanStore() {
  return useContext(Store);
}

export const StoreProvider = withRouter(injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    gitlabPipelineId,
    history,
  } = props;

  const tableDs = useMemo(() => new DataSet(TableDataset({
    projectId,
    gitlabPipelineId,
  })), [gitlabPipelineId, projectId]);

  const detailDs = useMemo(() => new DataSet(DetailDataSet({
    projectId,
    gitlabPipelineId,
  })), [gitlabPipelineId, projectId]);

  const statusMap = new Map([
    ['UNKNOWN', { code: 'unready', name: '未知' }],
    ['LOW', { code: 'running', name: '较低' }],
    ['MEDIUM', { code: 'opened', name: '中等' }],
    ['HIGH', { code: 'error', name: '严重' }],
    ['CRITICAL', { code: 'disconnect', name: '危机' }],
  ]);

  const value = {
    ...props,
    projectId,
    prefixCls: 'c7ncd-mirrorScanning',
    detailDs,
    tableDs,
    statusMap,
    history,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
