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
    return false;
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
                label={(
                  <p>
                    操作类型
                    <NewTips
                      helpText="基于当前配置修改表示您可直接在下方yml文件中进行修改；
                  回滚至历史版本表示您需要选择一个之前标记的版本备注，并使用当时的yml文件进行部署。"
                      style={{
                        fontSize: '16px !important',
                        position: 'relative',
                        bottom: '1px',
                      }}
                    />
                  </p>
                )}
                name={mapping.operation.name}
              />
              {
                HostDockerComposeDataSet?.current
                  ?.get(mapping.operation.name) === operationData[0].value ? (
                    <TextField
                      name={mapping.versionMark.name}
                      newLine
                      addonAfter={<NewTips helpText="您可为此次应用修改标记一个版本备注（形如：V1.0.0），标记后，后续便能在「历史版本」中定位此次配置，并支持回滚至该版本。此处若不填写，便不会生成历史版本。" />}
                    />
                  ) : (
                    <Select
                      newLine
                      name={mapping.versionMark.name}
                      addonAfter={<NewTips helpText="您可从历史版本中选择一个进行回滚，每个版本后面显示的内容（形如：2022.04.12-182712）表示的是该版本被标记时对应的年月日-时分秒。" />}
                      optionRenderer={({ record }) => {
                        const time = Moment(record?.get('creationDate')).format('YYYY.MM.DD-HHmmss');
                        return (
                          <p style={{ marginBottom: 0, display: 'flex' }}>
                            <span style={{
                              display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                            >
                              {record?.get('remark')}
                            </span>
                            <span style={{ display: 'inline-block' }}>{`(${time})`}</span>
                          </p>
                        );
                      }}
                    />
                  )
              }
            </>
          ) : (
            <TextField
              name={mapping.versionMark.name}
              addonAfter={<NewTips helpText="您可为此次应用创建标记一个版本备注（形如：V1.0.0），标记后，后续便能在「历史版本」中定位此次配置，并支持回滚至该版本。" />}
            />
          )
        }
      </Form>
      <p className={`${cssPrefix}-title`}>
        docker-compose.yml文件
        <NewTips className={`${cssPrefix}-title-tips`} helpText="您需直接在此处粘入docker-compose.yml文件，此处为必填。" />
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
        <NewTips className={`${cssPrefix}-title-tips`} helpText="您需在此处维护操作Docker Compose的命令，此处为必填。" />
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
