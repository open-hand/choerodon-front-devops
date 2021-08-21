/* eslint-disable max-len */
import { useMemo, useRef, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro//lib/data-set/DataSet';
import useLatest from '../useLatest';

type QueryProps<T> = {
  beforeQuery?:(...args:any[])=>any,
  afterQuery?:(data:T, ...args:any[])=>any,
  beforeThrowError?:(...args:any) => any,
  type?: 'query' | 'submit' | 'validate',
}

function useDataSet<T>(dataSetProps:DataSetProps, deps: any[]) {
  const dsRef = useLatest(dataSetProps);
  const depsRef = useLatest(deps);

  const dataSet:DataSet = useMemo(() => new DataSet(dsRef.current), [depsRef.current]);

  const query = useCallback(async (props?:QueryProps<T>) => {
    const {
      beforeQuery,
      afterQuery,
      beforeThrowError,
      type = 'query',
    } = props || {};
    try {
      typeof beforeQuery === 'function' && beforeQuery();
      if (type in dataSet) {
        const res:T = await dataSet[type]?.();
        typeof afterQuery === 'function' && afterQuery(res);
      } else {
        throw new Error(`${type} does not exist in DataSet`);
      }
    } catch (error) {
      typeof beforeThrowError === 'function' && beforeThrowError();
      throw new Error(error);
    }
  }, [dataSet]);

  return [dataSet, query] as const;
}

export default useDataSet;
