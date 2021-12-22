/* eslint-disable max-len */
import {
  useMemo, useCallback, useRef,
} from 'react';
import get from 'lodash/get';
import { TabkeyTypes } from '../interface';
import { useAppPipelineEditStore } from '../stores';

function useTabData<T>() {
  const {
    currentKey,
    setTabsDataState,
    tabsData,
  } = useAppPipelineEditStore();

  const setTabsDataStateRef = useRef(setTabsDataState);

  setTabsDataStateRef.current = setTabsDataState;

  const getCurrentTabData = useMemo(() => tabsData?.[currentKey] as T, [currentKey, tabsData]);

  const hendleSetTabData = useCallback(
    (data:T) => {
      setTabsDataStateRef.current?.({
        [currentKey]: data,
      });
    }, [currentKey],
  );

  const getTabData = useCallback((tabKey:TabkeyTypes) => get(tabsData, tabKey), [tabsData]);

  return [getCurrentTabData, hendleSetTabData, getTabData] as const;
}

export default useTabData;
