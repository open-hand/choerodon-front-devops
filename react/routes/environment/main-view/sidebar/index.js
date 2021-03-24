import React, { useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import setTreeMenuSelect from '../../../../utils/setTreeMenuSelect';
import TreeView from '../../../../components/tree-view';
import TreeItem from './tree-item';
import { useEnvironmentStore } from '../../stores';
import { useMainStore } from '../stores';

import './index.less';
import './theme4.less';

const TreeMenu = observer(() => {
  const {
    treeDs,
    envStore,
    prefixCls,
  } = useEnvironmentStore();
  const { mainStore } = useMainStore();
  const bounds = useMemo(() => mainStore.getNavBounds, [mainStore.getNavBounds]);
  const nodeRenderer = useCallback(
    (record, search) => <TreeItem record={record} search={search} />, [],
  );

  useEffect(() => {
    setTreeMenuSelect(treeDs, envStore);
  }, [treeDs.data]);

  return (
    <nav style={bounds} className={`${prefixCls}-sidebar`}>
      <TreeView
        ds={treeDs}
        store={envStore}
        nodesRender={nodeRenderer}
      />
    </nav>
  );
});

export default TreeMenu;
