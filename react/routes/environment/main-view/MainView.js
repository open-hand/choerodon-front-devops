import React, {
  useRef, lazy, Suspense, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import DragBar from '../../../components/drag-bar';
import Sidebar from './sidebar';
import { useEnvironmentStore } from '../stores';
import { useMainStore } from './stores';

import './index.less';

const Group = lazy(() => import('./contents/group'));
const Detail = lazy(() => import('./contents/detail'));
const EmptyPage = lazy(() => import('./contents/empty'));

const MainView = observer(() => {
  const {
    prefixCls,
    envStore: { getSelectedMenu: { itemType } },
    itemType: {
      DETAIL_ITEM,
      GROUP_ITEM,
    },
    treeDs,
  } = useEnvironmentStore();
  const { mainStore } = useMainStore();
  const rootRef = useRef();

  const content = useMemo(() => {
    const cmMaps = {
      [GROUP_ITEM]: <Group />,
      [DETAIL_ITEM]: <Detail />,
    };
    return cmMaps[itemType]
      ? <Suspense fallback={<Loading display type="c7n" />}>{cmMaps[itemType]}</Suspense>
      : <Loading display type="c7n" />;
  }, [itemType]);

  function getMainView() {
    if (!treeDs.length && treeDs.status === 'ready') {
      return (
        <div
          className={`${prefixCls}-wrap`}
        >
          <Suspense fallback={<span />}>
            <EmptyPage />
          </Suspense>
          <div>请先创建分组！</div>
        </div>
      );
    }
    return (
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
  }

  return getMainView();
});

export default MainView;
