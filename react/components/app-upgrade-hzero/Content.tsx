import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useAppUpgradeHzeroStore } from './stores';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';

const AppUpgradeHzero = observer(() => {
  const {
    mainStore,
    prefixCls,
  } = useAppUpgradeHzeroStore();

  useEffect(() => {

  }, []);

  return (
    <div className={prefixCls}>
      {{ AppUpgradeHzero }}
    </div>
  );
});

export default AppUpgradeHzero;
