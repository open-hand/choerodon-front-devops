import React, { useImperativeHandle, useEffect } from 'react';
import { observer } from 'mobx-react';
import Moment from 'moment';
import {
  Form, TextField, Select, SelectBox,
} from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import { devopsDockerComposeApi } from '@choerodon/master';
import { NewTips, YamlEditor } from '@choerodon/components';
import { useHostDockerCompose } from './stores';
import {
  mapping, transformSubmitData, transformLoadData, operationData,
} from './stores/hostdockercomposeDataSet';

import './index.less';

const cssPrefix = 'c7ncd-hostDockerCompose';

const Index = observer(() => {
  const {
    HostDockerComposeDataSet,
    cRef,
    data,
    modal,
    refresh,
  } = useHostDockerCompose();

  useEffect(() => {
    if (data) {
      HostDockerComposeDataSet.loadData([transformLoadData(data)]);
    }
  }, []);

  const currentValidate = async () => {
    const flag = await HostDockerComposeDataSet.validate();
    if (!flag) {
      if (!HostDockerComposeDataSet?.current?.get(mapping.dockerCompose.name)) {
        message.error('docker-compose.yml文件为必填');
      } else if (!HostDockerComposeDataSet?.current?.get(mapping.command.name)) {
        message.error('命令为必填');
      }
    }
    return flag;
  };

  const handleOk = async () => {
    const flag = await HostDockerComposeDataSet?.validate();
    if (flag) {
      const result = await currentValidate();
      if (result) {
        try {
          await devopsDockerComposeApi
            .editDockerCompose(data?.id, transformSubmitData(HostDockerComposeDataSet, data));
          refresh && refresh();
          return true;
        } catch (err) {
          return false;
        }
      } else {
        return result;
      }
    }
    return false;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const result = await currentValidate();
      if (!result) {
        return result;
      }
      return transformSubmitData(HostDockerComposeDataSet);
    },
  }));

  const getDockerComposeReadonly = () => {
    if (data) {
      const operaion = HostDockerComposeDataSet?.current?.get(mapping.operation.name);
      if (operaion === operationData[0].value) {
        return false;
      }
      return true;
    }
    return true;
  };

  return (
    <div
      className={cssPrefix}
      style={{
        marginTop: data ? 'unset' : '30px',
      }}
    >
      <Form columns={data ? 3 : 2} dataSet={HostDockerComposeDataSet}>
        {
          data ? (
            <>
              <TextField name={mapping.appName.name} />
              <TextField name={mapping.appCode.name} />
            </>
          ) : ''
        }
        {
          data ? (
            <>
              <SelectBox
                newLine
                name={mapping.operation.name}
              />
              {
                HostDockerComposeDataSet?.current
                  ?.get(mapping.operation.name) === operationData[0].value ? (
                    <TextField
                      name={mapping.versionMark.name}
                      newLine
                    />
                  ) : (
                    <Select
                      newLine
                      name={mapping.versionMark.name}
                      optionRenderer={({ record }) => {
                        const time = Moment(record?.get('creationDate')).format('YYYY.MM.DD-HHmmss');
                        return `${record?.get('remark')}(${time})`;
                      }}
                    />
                  )
              }
            </>
          ) : (
            <TextField name={mapping.versionMark.name} />
          )
        }
      </Form>
      <p className={`${cssPrefix}-title`}>
        docker-compose.yml文件
        <NewTips className={`${cssPrefix}-title-tips`} helpText="" />
      </p>
      <YamlEditor
        value={HostDockerComposeDataSet?.current?.get(mapping.dockerCompose.name)}
        modeChange={false}
        readOnly={getDockerComposeReadonly()}
        showError={false}
        onValueChange={(value: any) => {
          HostDockerComposeDataSet?.current.set(mapping.dockerCompose.name, value);
        }}
      />
      <p
        className={`${cssPrefix}-title`}
        style={{
          marginTop: 24,
        }}
      >
        命令
        <NewTips className={`${cssPrefix}-title-tips`} helpText="" />
      </p>
      <YamlEditor
        value={HostDockerComposeDataSet?.current?.get(mapping.command.name)}
        modeChange={false}
        readOnly={false}
        showError={false}
        onValueChange={(value: any) => {
          HostDockerComposeDataSet?.current.set(mapping.command.name, value);
        }}
      />
    </div>
  );
});

export default Index;
