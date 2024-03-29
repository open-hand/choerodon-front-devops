import React, {
  useRef, lazy, Suspense, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { Loading } from '@choerodon/components';
import Sidebar from './sidebar';
import DragBar from '../../../components/drag-bar';
import EmptyPage from '../../../components/empty-page';
import { AppDeletionsModal } from '@/components/app-deletion-with-vertification-code';
import { useResourceStore } from '../stores';
import { useMainStore } from './stores';

import './index.less';

// 实例视图
// const AppContent = lazy(() => import('./contents/application'));
const IstContent = lazy(() => import('./contents/instance'));

// 资源视图
const ResourceEnvContent = lazy(() => import('./contents/resource-env'));
const NetworkContent = lazy(() => import('./contents/network'));
const IngressContent = lazy(() => import('./contents/ingress'));
const CertContent = lazy(() => import('./contents/certificate'));
const ConfigMapContent = lazy(() => import('./contents/configMap'));
const SecretContent = lazy(() => import('./contents/secret'));
const CustomContent = lazy(() => import('./contents/custom'));
const IstListContent = lazy(() => import('./contents/instance-list'));// Chart应用
const CustomDetail = lazy(() => import('./contents/custom-detail'));
const IngressDetail = lazy(() => import('./contents/ingress-detail'));
const CertDetail = lazy(() => import('./contents/certificate-detail'));
const ConfigMapDetail = lazy(() => import('./contents/config-detail'));
const SecretDetail = lazy(() => import('./contents/secret-detail'));
const ServiceDetail = lazy(() => import('./contents/service-detail'));
const PVCContent = lazy(() => import('./contents/pvc'));
const WorkloadContent = lazy(() => import('./contents/workload'));

const EmptyShown = lazy(() => import('./contents/empty'));

const MainView = observer(() => {
  const {
    prefixCls,
    resourceStore,
    itemTypes: {
      ENV_ITEM,
      // APP_ITEM,
      IST_ITEM,
      SERVICES_ITEM,
      INGRESS_ITEM,
      CERT_ITEM,
      MAP_ITEM,
      CIPHER_ITEM,
      CUSTOM_ITEM,
      SERVICES_GROUP,
      INGRESS_GROUP,
      CERT_GROUP,
      MAP_GROUP,
      CIPHER_GROUP,
      CUSTOM_GROUP,
      IST_GROUP,
      PVC_GROUP,
      WORKLOAD_GROUP,
    },
    treeDs,
    intl: { formatMessage },
  } = useResourceStore();
  const { deletionStore, mainStore } = useMainStore();
  const rootRef = useRef(null);

  const { getSelectedMenu: { parentId } } = resourceStore;
  const { getDeleteArr } = deletionStore;

  const deleteModals = useMemo(() => (
    map(getDeleteArr, ({
      name, display, deleteId, type, refresh, envId,
    }) => (
      <AppDeletionsModal
        key={deleteId}
        envId={envId || parentId.split('**')[0]}
        store={deletionStore}
        title={`${formatMessage({ id: `${type}.delete` })}“${name}”`}
        visible={display}
        objectId={deleteId}
        objectType={type}
        refresh={refresh}
      />
    ))
  ), [getDeleteArr]);

  const content = useMemo(() => {
    const {
      getSelectedMenu: { itemType },
    } = resourceStore;
    if (!itemType) return <Loading display type="c7n" />;
    const cmMaps = {
      // [ENV_ITEM]: getViewType === IST_VIEW_TYPE ? <EnvContent /> : <ResourceEnvContent />,
      [ENV_ITEM]: <ResourceEnvContent />,
      // [APP_ITEM]: <AppContent />,
      [IST_ITEM]: <IstContent />,
      [SERVICES_GROUP]: <NetworkContent />,
      [INGRESS_GROUP]: <IngressContent />,
      [CERT_GROUP]: <CertContent />,
      [MAP_GROUP]: <ConfigMapContent />,
      [CIPHER_GROUP]: <SecretContent />,
      [CUSTOM_GROUP]: <CustomContent />,
      [IST_GROUP]: <IstListContent />,
      [CUSTOM_ITEM]: <CustomDetail />,
      [INGRESS_ITEM]: <IngressDetail />,
      [CERT_ITEM]: <CertDetail />,
      [MAP_ITEM]: <ConfigMapDetail />,
      [CIPHER_ITEM]: <SecretDetail />,
      [SERVICES_ITEM]: <ServiceDetail />,
      [PVC_GROUP]: <PVCContent />,
      [WORKLOAD_GROUP]: <WorkloadContent />,
    };
    return cmMaps[itemType]
      ? <Suspense fallback={<Loading display type="c7n" />}>{cmMaps[itemType]}</Suspense>
      : (
        <EmptyPage
          title="没有该类型资源"
          describe="请稍后重试"
        />
      );
  }, [resourceStore.getSelectedMenu.itemType]);

  return (!treeDs.length && treeDs.status === 'ready' && !resourceStore.getSearchValue) ? (
    <div className={`${prefixCls}-wrap`}>
      <Suspense fallback={<span />}>
        <EmptyShown />
      </Suspense>
    </div>
  ) : (
    <div
      ref={rootRef}
      className={`${prefixCls}-wrap`}
    >
      <DragBar
        parentRef={rootRef}
        store={mainStore}
      />
      <Sidebar />
      <div className={`${prefixCls}-main ${prefixCls}-animate`}>
        {content}
      </div>
      {deleteModals}
    </div>
  );
});

export default MainView;
