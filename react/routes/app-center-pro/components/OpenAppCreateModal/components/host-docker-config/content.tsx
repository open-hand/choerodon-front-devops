import React, { useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Select,
  TextField,
  SelectBox,
  Password,
} from 'choerodon-ui/pro';
import { YamlEditor } from '@choerodon/components';
import { mapping, transformSubmitData, deployTypeOptionsData } from './stores/hostDockerConfigDataSet';
import { useDockerConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-config/stores';

const Index = observer(() => {
  const {
    HostDockerConfigDataSet,
    cRef,
    detail,
    refresh,
  } = useDockerConfigStore();

  console.log(detail);

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await HostDockerConfigDataSet?.current?.validate(true);
      if (flag) {
        return transformSubmitData(HostDockerConfigDataSet);
      }
      return false;
    },
  }));

  return (
    <>
      <Form columns={2} dataSet={HostDockerConfigDataSet}>
        <SelectBox name={mapping.deployType.name} />
        {
          HostDockerConfigDataSet?.current?.get(mapping.deployType.name)
          === deployTypeOptionsData[0].value ? (
            <>
              <Select newLine name={mapping.repoName.name} />
              <Select name={mapping.imageName.name} />
              <Select name={mapping.tag.name} />
              <TextField name={mapping.name.name} />
            </>
            ) : (
              <>
                <TextField
                  name={mapping.imageUrl.name}
                  newLine
                />
                <TextField name={mapping.name.name} />
                <SelectBox
                  name="privateRepository"
                />
                {
                  HostDockerConfigDataSet?.current?.get(mapping.privateRepository.name) ? (
                    <>
                      <TextField newLine name={mapping.username.name} />
                      <Password name={mapping.password.name} />
                    </>
                  ) : ''
                }
              </>
            )
        }

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
