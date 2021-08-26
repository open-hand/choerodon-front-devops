import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Select } from 'choerodon-ui/pro';
import { useHostAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores';
import { mapping } from './stores/hostAppConfigDataSet';

const Index = observer(() => {
  const {
    HostAppConfigDataSet,
  } = useHostAppConfigStore();

  return (
    <div className="c7ncd-appCenterPro-hostAppConfig">
      <Form columns={3} dataSet={HostAppConfigDataSet}>
        <Select name={mapping.host.name} />
      </Form>
    </div>
  );
});

export default Index;
