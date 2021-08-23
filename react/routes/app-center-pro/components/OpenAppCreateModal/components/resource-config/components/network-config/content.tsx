import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import {
  useNetworkConfig,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config/stores';
import { mapping } from './stores/networkConfigDataSet';

import './index.less';

const Index = observer(() => {
  const {
    NetworkConfigDataSet,
  } = useNetworkConfig();

  return (
    <div className="c7ncd-appCenterPro-newConfig">
      <p className="c7ncd-appCenterPro-newConfig__title">网络配置 (Service)</p>
      <Form dataSet={NetworkConfigDataSet}>
        <TextField name={mapping.netName.name} />
      </Form>
    </div>
  );
});

export default Index;
