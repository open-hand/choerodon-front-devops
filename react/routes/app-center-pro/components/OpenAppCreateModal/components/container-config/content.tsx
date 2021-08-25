import React from 'react';
import { observer } from 'mobx-react-lite';
import { Record } from '@/interface';
import ContainerGroup from './components/container-group';
import ContainerDetail from './components/container-detail';
import { useContainerConfig } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores';
import { mapping } from './stores/conGroupDataSet';

import './index.less';

const Index = observer(() => {
  const {
    ConGroupDataSet,
  } = useContainerConfig();
  return (
    <div className="c7ncd-appCenterPro-conConfig">
      <ContainerGroup
        className="c7ncd-appCenterPro-conConfig__conGroup"
        dataSource={ConGroupDataSet}
      />
      <ContainerDetail
        className="c7ncd-appCenterPro-conConfig__conDetail"
        dataSource={ConGroupDataSet
          .records.find((record: Record) => record.get(mapping.focus.name))}
      />
    </div>
  );
});

export default Index;
