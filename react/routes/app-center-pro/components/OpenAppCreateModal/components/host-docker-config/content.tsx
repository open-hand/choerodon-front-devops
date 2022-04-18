import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Select,
  TextField,
  SelectBox,
  Password,
} from 'choerodon-ui/pro';
import { YamlEditor } from '@choerodon/components';
import { devopsDeployApi } from '@choerodon/master';
import {
  mapping,
  transformSubmitData,
  deployTypeOptionsData,
  transformLoadData,
} from './stores/hostDockerConfigDataSet';
import { useDockerConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-config/stores';

const Index = observer(() => {
  const {
    HostDockerConfigDataSet,
    cRef,
    detail,
    refresh,
    modal,
    isDetail,
  } = useDockerConfigStore();

  useEffect(() => {
    if (detail) {
      const data = transformLoadData(detail);
      HostDockerConfigDataSet.loadData([data]);
    }
  }, []);

  const handleSubmit = async () => {
    const res = await HostDockerConfigDataSet.validate();
    const record = HostDockerConfigDataSet?.current;
    if (res) {
      const data = {
        ...transformSubmitData(HostDockerConfigDataSet),
        [mapping.appName.name as string]: record?.get(mapping.appName.name),
        [mapping.appCode.name as string]: record?.get(mapping.appCode.name),
        operation: 'update',
        hostAppId: detail?.id,
        hostId: detail?.hostId,
      };
      try {
        await devopsDeployApi.deployDocker(data);
        refresh && refresh();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  if (modal && detail) {
    console.log(modal);
    modal.handleOk(handleSubmit);
  }

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await HostDockerConfigDataSet?.current?.validate(true);
      if (flag) {
        return ({
          ...transformSubmitData(HostDockerConfigDataSet),
          operation: 'create',
        });
      }
      return false;
    },
  }));

  return (
    <>
      <Form columns={2} dataSet={HostDockerConfigDataSet}>
        {
          isDetail && (
            <>
              <TextField name={mapping.appName.name} />
              <TextField name={mapping.appCode.name} />
            </>
          )
        }
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
