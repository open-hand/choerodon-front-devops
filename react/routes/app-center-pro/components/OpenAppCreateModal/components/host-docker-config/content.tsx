import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Select,
  TextField,
} from 'choerodon-ui/pro';
import { YamlEditor } from '@choerodon/components';
import { mapping } from './stores/hostDockerConfigDataSet';
import { useDockerConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-config/stores';

const Index = observer(() => {
  const {
    HostDockerConfigDataSet,
  } = useDockerConfigStore();

  return (
    <>
      <Form columns={2} dataSet={HostDockerConfigDataSet}>
        <Select name={mapping.repoName.name} />
        <Select name={mapping.imageName.name} />
        <TextField name={mapping.tag.name} />
        <TextField name={mapping.name.name} />
      </Form>
      <YamlEditor
        readOnly={false}
        value={HostDockerConfigDataSet?.current?.get(mapping.value.name)}
        onValueChange={
          (data: string) => HostDockerConfigDataSet?.current.set(mapping.value.name, data)
}
      />
    </>
  );
});

export default Index;
