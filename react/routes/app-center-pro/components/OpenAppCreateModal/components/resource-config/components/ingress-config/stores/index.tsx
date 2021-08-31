import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import ingressDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/ingress-config/stores/ingressDataSet';
import pathListDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/ingress-config/stores/pathListDataSet';
import annotationDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/ingress-config/stores/annotationDataSet';

interface ContextType {
  children: any,
  envId: string,
  IngressDataSet: any,
  PathListDataSet: any,
  AnnotationDataSet: any,
  cRef: any,
}

const Store = createContext({} as ContextType);

export function useIngressConfig() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const IngressDataSet = useMemo(() => new DataSet(ingressDataSet()), []);
  const PathListDataSet = useMemo(() => new DataSet(pathListDataSet()), []);
  const AnnotationDataSet = useMemo(() => new DataSet(annotationDataSet()), []);

  const value = {
    ...props,
    IngressDataSet,
    PathListDataSet,
    AnnotationDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};