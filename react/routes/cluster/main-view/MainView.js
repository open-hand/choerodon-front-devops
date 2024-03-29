import React, {
  useRef, useMemo, lazy, Suspense,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import Sidebar from './sidebar';
import DragBar from '../../../components/drag-bar';
import { useClusterStore } from '../stores';
import { useClusterMainStore } from './stores';

import './index.less';
import './theme4.less';

const ClusterContent = lazy(() => import('./contents/cluster-content'));
const NodeContent = lazy(() => import('./contents/node-content'));
const EmptyShown = lazy(() => import('./contents/empty'));

export default observer(() => {
  const {
    prefixCls,
    clusterStore: {
      getSelectedMenu: { itemType },
    },
    itemType: {
      CLU_ITEM,
      NODE_ITEM,
    },
    treeDs,
  } = useClusterStore();

  const { mainStore } = useClusterMainStore();
  const rootRef = useRef(null);

  const content = useMemo(() => {
    const cmMaps = {
      [CLU_ITEM]: <ClusterContent />,
      [NODE_ITEM]: <NodeContent />,
    };
    return cmMaps[itemType]
      ? <Suspense fallback={<Loading display type="c7n" />}>{cmMaps[itemType]}</Suspense>
      : <Loading display type="c7n" />;
  }, [itemType]);

  return (!treeDs.length && treeDs.status === 'ready') ? (
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
    </div>
  );
});
