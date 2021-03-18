import React, {
  createContext, useCallback, useContext, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { Record } from '@/interface';
import { isEmpty } from 'lodash';
import AppVersionTableDataSet from './AppVersionTableDataSet';
import MarketServiceListDataSet from './MarketServiceListDataSet';
import MarketTableDataSet from './MarketTableDataSet';
import AllMarketDataSet from './AllMarketDataSet';
import SearchDataSet from './SearchDataSet';
import AllMarketVersionDataSet from './AllMarketVersionDataSet';
import useStore, { TableStoreProps } from './useStore';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  refresh(callback?:CallableFunction):void,
  modal: any,
  tableDs: DataSet,
  searchDs: DataSet,
  selectedDs: DataSet,
  importRecord: Record,
  mainStore: TableStoreProps,
  checkData(): boolean, // 已选中的市场服务校验函数
  setAppChildren(record: Record): void, // 设置版本数据
  setVersionChildren(record: Record): void, // 设置市场服务数据
  handleMarketServiceCheck(data: SetCheckProps): void, // 市场服务勾选框事件
  getChecked(record: Record): boolean, // 判断勾选框是否选中
  getIndeterminate(record: Record): boolean, // 判断勾选框是否不定状态
  getAppIndeterminate(record: Record): boolean, // 判断应用勾选框是否不定状态
  handleAppExpand(expanded: boolean, record: Record): void, // 展开应用
  handleVersionExpand(record: Record): void, // 展开应用版本
}

export interface SetCheckProps {
  checked: boolean,
  childRecord: Record,
  childDs: DataSet,
  parentDs: DataSet,
  parentRecord: Record,
  record: Record,
}

const Store = createContext({} as ContextProps);

export function useMarketTableStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    selectedDs,
  } = props;
  const intlPrefix = 'c7ncd.appService.market';

  const mainStore = useStore();

  const setAppChildren = useCallback((record: Record) => {
    if (!record.get('childrenDataSet')) {
      const childrenDs = new DataSet(AppVersionTableDataSet(setVersionChildren));
      record.set('childrenDataSet', childrenDs);
      childrenDs.loadData(record.get('appVersionVOS') || []);
    }
  }, []);

  const setVersionChildren = useCallback((record: Record) => {
    if (!record.get('childrenDataSet')) {
      const childrenDs = new DataSet(MarketServiceListDataSet());
      record.set('childrenDataSet', childrenDs);
      childrenDs.loadData(record.get('marketServiceVOList') || []);
    }
  }, []);

  const handleMarketServiceCheck = useCallback(({
    checked, childRecord, childDs, parentDs, parentRecord, record,
  }) => {
    if (checked) {
      childDs.select(childRecord);
    } else {
      childDs.unSelect(childRecord);
    }
    // eslint-disable-next-line no-param-reassign
    parentRecord.isSelected = getChecked(parentRecord) && !getIndeterminate(parentRecord);
    parentRecord.set('indeterminate', getChecked(parentRecord) && getIndeterminate(parentRecord));
    // eslint-disable-next-line no-param-reassign
    record.isSelected = getChecked(record) && !getIndeterminate(record);
    record.set('indeterminate', getAppIndeterminate(record));
  }, []);

  const getChecked = useCallback((eachRecord: Record) => eachRecord.get('childrenDataSet') && !isEmpty(eachRecord.get('childrenDataSet').selected), []);

  const getIndeterminate = useCallback((eachRecord: Record) => {
    const childrenDataSet = eachRecord.get('childrenDataSet');
    return !!childrenDataSet.selected.length
      && childrenDataSet.selected.length !== childrenDataSet.length;
  }, []);

  const getAppIndeterminate = useCallback((eachRecord: Record) => {
    const childrenDataSet = eachRecord.get('childrenDataSet');
    return childrenDataSet.some((record: Record) => record.get('indeterminate'))
      || (!!childrenDataSet.selected.length
        && childrenDataSet.selected.length !== childrenDataSet.length);
  }, []);

  const handleAppExpand = useCallback(async (expanded, record) => {
    if (expanded && !record.get('childrenDataSet')) {
      setAppChildren(record);
    }
  }, []);

  const handleVersionExpand = useCallback(async (eachRecord: Record) => {
    if (!eachRecord.get('expand')) {
      setVersionChildren(eachRecord);
    }
    eachRecord.set('expand', !eachRecord.get('expand'));
  }, []);

  const tableDs = useMemo(() => new DataSet(MarketTableDataSet({
    intlPrefix,
    formatMessage,
    selectedDs,
    setAppChildren,
    setVersionChildren,
    handleMarketServiceCheck,
    handleAppExpand,
    handleVersionExpand,
  })), []);
  const allAppDs = useMemo(() => new DataSet(AllMarketDataSet()), []);
  const allAppVersionDs = useMemo(() => new DataSet(AllMarketVersionDataSet()), []);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({
    intlPrefix, formatMessage, allAppDs, allAppVersionDs, tableDs,
  })), []);

  const value = {
    ...props,
    formatMessage,
    intlPrefix,
    prefixCls: 'c7ncd-appService-market',
    tableDs,
    searchDs,
    mainStore,
    setAppChildren,
    setVersionChildren,
    getChecked,
    getIndeterminate,
    getAppIndeterminate,
    handleMarketServiceCheck,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
