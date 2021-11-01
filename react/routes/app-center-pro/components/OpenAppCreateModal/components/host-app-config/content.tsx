/* eslint-disable */
// @ts-nocheck
import React, { useImperativeHandle, useEffect,useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, Button, TextField, Output, DataSet,
} from 'choerodon-ui/pro';
import { Upload, Icon, Button as OldButton, Tabs, Alert, message } from 'choerodon-ui';
import { CustomSelect, ChunkUploader } from '@choerodon/components';
import { Base64 } from 'js-base64';
import { useHostAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores';
import { mapping } from './stores/hostAppConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';
import OperationYaml from '../operation-yaml';

import './index.less';
import '../container-config/components/container-detail/index.less';

import '../container-config/components/container-detail/index.less';
import StatusDot from '@/components/status-dot';
import { LabelAlignType, LabelLayoutType } from '@/interface';

const TabPane = Tabs.TabPane;

const jarSource = [
  ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
  productSourceData[5],
];

const valueCheckValidate = (value, startCommand, postCommand) => {
  if (!value && !startCommand && !postCommand) {
    message.error('前置命令】、【启动命令】、【后置命令】三者之中，必须至少填写一个');
    return false;
  }
  return true;
}

const setData = (data: any,configData?:any) => {  
  const newData = data;
  newData.prodJarInfoVO = {
    [mapping.projectProductRepo.name as string]: newData[
      mapping.projectProductRepo.name as string]?.repositoryId
    || newData[
      mapping.projectProductRepo.name as string],
    [mapping.groupId.name as string]: newData[mapping.groupId.name as string],
    [mapping.artifactId.name as string]: newData[mapping.artifactId.name as string],
    [mapping.jarVersion.name as string]: newData[mapping.jarVersion.name as string],
    [mapping.nexus.name as string]: newData[mapping.nexus.name as string],
  };
  newData.fileInfoVO = {
    [mapping.uploadUrl.name as string]: newData[mapping.uploadUrl.name as string],
    [mapping.fileName.name as string]: newData[mapping.fileName.name as string],
  }
  newData.marketDeployObjectInfoVO = {
    mktDeployObjectId: newData[
      mapping.marketServiceVersion.name as string]?.marketServiceDeployObjectVO?.id,
    mktAppVersionId: newData[
      mapping.marketServiceVersion.name as string]
      ?.marketServiceDeployObjectVO?.marketAppVersionId,
  };
  newData[mapping.value.name as string] = newData[mapping.value.name as string] ? Base64.encode(newData[mapping.value.name as string]) : '';
  newData[mapping.startCommand.name as string] = newData[mapping.startCommand.name as string] ? Base64.encode(newData[mapping.startCommand.name as string]) : '';
  newData[mapping.postCommand.name as string] = newData[mapping.postCommand.name as string] ? Base64.encode(newData[mapping.postCommand.name as string]) : '';
  // newData.deployObjectId = newData[
  //   mapping.marketServiceVersion.name as string]?.marketServiceDeployObjectVO?.id;
  newData.configSettingVOS= configData || data.configSettingVOS;
  return newData;
};

const Index = observer(() => {
  const {
    HostAppConfigDataSet,
    cRef,
    detail,
    modal,
    refresh,
    AppState: { currentMenuType: { organizationId } },
    configurationCenterDataSet,
    configCompareOptsDS,
  } = useHostAppConfigStore();

  const queryMarketAppVersionOptions = (data: any, ds: any) => {
    if (data[mapping.jarSource.name] === 'hzero') {
      const optionsDs = ds.current?.getField(mapping.marketAppVersion.name).options;
      optionsDs.setQueryParameter('type', 'hzero');
      optionsDs.query();
    } else {
      const optionsDs = ds.current?.getField(mapping.marketAppVersion.name).options;
      optionsDs.setQueryParameter('type', 'common');
      optionsDs.query();
    }
  }

  useEffect(() => {
    if (typeof (detail) === 'object') {
      HostAppConfigDataSet.loadData([{
        ...detail,
        ...detail?.prodJarInfoVO || {},
        ...detail?.fileInfoVO || {},
        [mapping.value.name]: detail[mapping.value.name] ? Base64.decode(detail[mapping.value.name]) : '',
        [mapping.startCommand.name]: detail[mapping.startCommand.name] ? Base64.decode(detail[mapping.startCommand.name]) : '',
        [mapping.postCommand.name]: detail[mapping.postCommand.name] ? Base64.decode(detail[mapping.postCommand.name]) : '',
        [mapping.marketAppVersion.name as string]: detail
          ?.marketDeployObjectInfoVO?.mktAppVersionId,
        [mapping.marketServiceVersion.name as string]: detail
          ?.marketDeployObjectInfoVO?.mktDeployObjectId,
      }]);
      queryMarketAppVersionOptions(detail, HostAppConfigDataSet);
    }
  }, []);

   // TODO: 修改主机应用 校验+数据
  const handleOk = async () => {
    const configData = configurationCenterDataSet.toData().map(o=>{
        return {configId:o.configId,mountPath:o.mountPath,configGroup:o.configGroup,configCode:o.configCode};
    });
    HostAppConfigDataSet.current?.set('configSettingVOS',configData)
    const finalFunc = async () => {
      const res = await HostAppConfigDataSet.submit();
      if (res !== false) {
        if (refresh) {
          refresh();
        }
        return true;
      }
      return false;
    }
    if (detail?.[mapping.jarSource.name] === productSourceData[7].value) {
      return await finalFunc();
    } else {
      const flag = valueCheckValidate(
        HostAppConfigDataSet.current.get(mapping.value.name),
          HostAppConfigDataSet.current.get(mapping.startCommand.name),
          HostAppConfigDataSet.current.get(mapping.postCommand.name)
      );
      const configFlag = await configurationCenterDataSet.validate();
      if (flag && configFlag) {
        return await finalFunc();
      }
    }
    return false;
  };

  if (detail && modal) {
    modal.handleOk(handleOk);
  }

  // TODO: 创建主机应用 校验+数据
  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
       const configCenterFlag = await configurationCenterDataSet.validate();
      if (valueCheckValidate(
        HostAppConfigDataSet.current.get(mapping.value.name),
        HostAppConfigDataSet.current.get(mapping.startCommand.name),
        HostAppConfigDataSet.current.get(mapping.postCommand.name)
        ) && configCenterFlag) {
        const flag = await HostAppConfigDataSet.validate();
        const configData = configurationCenterDataSet.toData().map(o=>{
            return {configId:o.configId,mountPath:o.mountPath,configGroup:o.configGroup,configCode:o.configCode};
        });
        if (flag) {
          return setData(HostAppConfigDataSet.current.toData(),configData);
        }
        return false;
      }
      return false;
    },
  }));

  const renderFormByProductSource = () => {
    const dataSource = HostAppConfigDataSet?.current;
    if (dataSource) {
      switch (dataSource.get(mapping.jarSource.name)) {
        case productSourceData[0].value: {
          return (
            <>
              <Select
                name={mapping.nexus.name}
                disabled={Boolean(detail)}
              />
              <Select
                name={mapping.projectProductRepo.name}
                disabled={Boolean(detail)}
              />
              <Select
                name={mapping.groupId.name}
                disabled={Boolean(detail)}
              />
              <Select
                name={mapping.artifactId.name}
                disabled={Boolean(detail)}
              />
              <Select name={mapping.jarVersion.name} />
            </>
          );
        }
        case productSourceData[1].value: case productSourceData[2].value: {
          return (
            <>
              <Select name={mapping.marketAppVersion.name} />
              <Select name={mapping.marketServiceVersion.name} />
            </>
          );
        }
        case productSourceData[5].value: {
          return (
            <>
                <ChunkUploader
                  callbackWhenLoadingChange={(loadingIf: boolean) => {
                    console.log(loadingIf);
                    // modal.update({
                    //   okProps: {
                    //     disabled: loadingIf,
                    //   },
                    // });
                  }}
                  combineUrl={`${window._env_.API_HOST}/hfle/v1/${organizationId}/upload/fragment-combine`}
                  // disabled={!ImportFileDataSet?.current?.get(mapping().folderId.name)}
                  suffix={dataSource?.get('rdupmType') === 'other' ? undefined : '.jar'}
                  paramsData={{
                    bucketName: 'devops-service',
                  }}
                  accept={dataSource?.get('rdupmType') === 'other' ? undefined : '.jar'}
                  prefixPatch="/hfle"
                  showUploadList={true}
                  onSuccess={(res, file) => {
                    dataSource.set(mapping.fileName.name, file.name);
                  }}
                  callback={(str: string) => {
                    dataSource.set(mapping.uploadUrl.name, str);
                  }}
                >
                  <OldButton
                    type="dashed"
                    icon="file_upload_black-o"
                  >上传文件</OldButton>
                </ChunkUploader>
                {/* <Upload> */}
                {/*  <Button icon="file_upload"> */}
                {/*    上传文件 */}
                {/*  </Button> */}
                {/* </Upload> */}
                { dataSource.get(mapping.uploadUrl.name) && (
                  <p
                    newLine className="c7ncd-appCenterPro-conDetail__fileName"
                    style={{
                      width: '100%',
                    }}
                  >
                      <span className="c7ncd-appCenterPro-conDetail__fileName__fileIcon">
                        <Icon type="attach_file" />
                        <span>
                          {dataSource.get(mapping.fileName.name)}
                        </span>
                      </span>
                    <Icon
                      onClick={() => {
                        dataSource.set(mapping.fileName.name, '');
                        dataSource.set(mapping.uploadUrl.name, '');
                      }}
                      type="delete"
                      style={{
                        cursor: 'pointer',
                        color: '#5365EA',
                      }}
                    />
                  </p>
                ) }
            </>
          );
        }
        // case productSourceData[1].value: case productSourceData[2].value: {
        //   return (
        //     <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
        //       <Select name={mapping.marketAppVersion.name} />
        //       <Select name={mapping.marketServiceVersion.name} />
        //     </Form>
        //   );
        // }
        // case productSourceData[5].value: {
        //   return (
        //     <Form className="c7ncd-appCenterPro-conDetail__form">
        //       <Upload>
        //         <Button icon="file_upload">
        //           上传文件
        //         </Button>
        //       </Upload>
        //     </Form>
        //   );
        // }
        default: {
          return '';
        }
      }
    }
    return '';
  };

  const renderHostOption = ({ record, text }: any) => (
    <>
      <StatusDot
        // @ts-ignore
        size="small"
        synchronize
        connect={record.get('connect')}
      />
      {text}
    </>
  );

  const renderDetailForm = () => detail && (
    <>
      <TextField
        name={mapping.appName.name}
      />
      <TextField
        disabled
        name={mapping.appCode.name}
      />
    </>
  );

  return (
    <div className="c7ncd-appCenterPro-hostAppConfig">
      {
        detail ? '' : (
          <>
            <Form style={{ marginTop: 20 }} columns={3} dataSet={HostAppConfigDataSet}>
              {/*<Select
                name={mapping.host.name}
                optionRenderer={renderHostOption}
                disabled={Boolean(detail)}
                onOption={({ record: hostRecord }) => ({
                  disabled: !hostRecord.get('connect'),
                })}
              />*/}
            </Form>
            <p>
              jar包来源
            </p>
            <div className="c7ncd-appCenterPro-conDetail__productType">
              <CustomSelect
                onClickCallback={
                  (value) => HostAppConfigDataSet.current.set(mapping.jarSource.name, value.value)
                }
                selectedKeys={HostAppConfigDataSet.current.get(mapping.jarSource.name)}
                data={jarSource}
                identity="value"
                mode="single"
                customChildren={(item): any => (
                  <div className="c7ncd-appCenterPro-conDetail__productSource__item">
                    <img src={item.img} alt="" />
                    <p>
                      {item.name}
                    </p>
                  </div>
                )}
              />
            </div>
          </>
        )
      }
      <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={HostAppConfigDataSet?.current}>
        {
          renderDetailForm()
        }
        {
          detail && (
            <>
              <Select
                name={mapping.host.name}
                optionRenderer={renderHostOption}
                disabled={Boolean(detail)}
                onOption={({ record: hostRecord }) => ({
                  disabled: !hostRecord.get('connect'),
                })}
              />
              {
                (detail?.rdupmType === 'other') || (detail?.[mapping.jarSource.name] === productSourceData[7].value) ? '' : (
                  <Select
                    name={mapping.jarSource.name}
                    disabled
                  />
                )
              }
            </>
          )
        }
        { renderFormByProductSource() }
      </Form>
      {
        detail && detail?.[mapping.jarSource.name] === productSourceData[7].value ? '' : (
          <OperationYaml
            style={{
              marginBottom: 20,
            }}
            dataSet={HostAppConfigDataSet}
            configDataSet={configurationCenterDataSet}
            optsDS={configCompareOptsDS}
            preName={mapping.value.name}
            startName={mapping.startCommand.name}
            postName={mapping.postCommand.name}
          />
        )
      }
    </div>
  );
});

export default Index;

export { setData, valueCheckValidate };
