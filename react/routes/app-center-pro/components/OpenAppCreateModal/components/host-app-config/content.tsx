/* eslint-disable */
// @ts-nocheck
import React, { useImperativeHandle, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, Button, TextField, Output,
} from 'choerodon-ui/pro';
import { Upload, Icon, Button as OldButton } from 'choerodon-ui';
import { CustomSelect, ChunkUploader } from '@choerodon/components';
import { Base64 } from 'js-base64';
import { useHostAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores';
import { mapping } from './stores/hostAppConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

import './index.less';
import '../container-config/components/container-detail/index.less';

import '../container-config/components/container-detail/index.less';
import StatusDot from '@/components/status-dot';
import { LabelAlignType, LabelLayoutType } from '@/interface';

const jarSource = [
  ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
  productSourceData[5],
];

const setData = (data: any) => {
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
  newData[mapping.value.name as string] = Base64.encode(newData[mapping.value.name as string]);
  // newData.deployObjectId = newData[
  //   mapping.marketServiceVersion.name as string]?.marketServiceDeployObjectVO?.id;
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
        value: detail.value ? Base64.decode(detail.value) : '',
        [mapping.marketAppVersion.name as string]: detail
          ?.marketDeployObjectInfoVO?.mktAppVersionId,
        [mapping.marketServiceVersion.name as string]: detail
          ?.marketDeployObjectInfoVO?.mktDeployObjectId,
      }]);
      queryMarketAppVersionOptions(detail, HostAppConfigDataSet);
    }
  }, []);

  const handleOk = async () => {
    const res = await HostAppConfigDataSet.submit();
    if (res !== false) {
      if (refresh) {
        refresh();
      }
      return true;
    }
    return false;
  };

  if (detail && modal) {
    modal.handleOk(handleOk);
  }

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await HostAppConfigDataSet.validate();
      if (flag) {
        return setData(HostAppConfigDataSet.current.toData());
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
                  suffix=".jar"
                  paramsData={{
                    bucketName: 'devops-service',
                  }}
                  accept=".jar"
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
                    icon="file_upload"
                  >上传文件</OldButton>
                </ChunkUploader>
                {/* <Upload> */}
                {/*  <Button icon="file_upload"> */}
                {/*    上传文件 */}
                {/*  </Button> */}
                {/* </Upload> */}
                { dataSource.get(mapping.uploadUrl.name) && (
                  <p className="c7ncd-appCenterPro-conDetail__fileName">
                      <span className="c7ncd-appCenterPro-conDetail__fileName__fileIcon">
                        <Icon type="attach_file" />
                        <span>
                          {dataSource.get(mapping.fileName.name)}
                        </span>
                      </span>
                    <Icon
                      onClick={() => {
                        dataSource.set(mapping.fileName.name, '');
                        dataSource.set(mapping.uploadFile.name, '');
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
              <Select
                name={mapping.host.name}
                optionRenderer={renderHostOption}
                disabled={Boolean(detail)}
                onOption={({ record: hostRecord }) => ({
                  disabled: !hostRecord.get('connect'),
                })}
              />
            </Form>
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
              <Select
                name={mapping.jarSource.name}
                disabled
              />
            </>
          )
        }
        { renderFormByProductSource() }
      </Form>
      <YamlEditor
        readOnly={false}
        value={HostAppConfigDataSet.current.get(mapping.value.name)}
        onValueChange={(value: string) => {
          HostAppConfigDataSet.current.set(mapping.value.name, value);
        }}
      />
    </div>
  );
});

export default Index;

export { setData };
