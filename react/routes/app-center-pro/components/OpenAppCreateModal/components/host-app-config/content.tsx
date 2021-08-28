import React, { useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, Button, TextField, Output,
} from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { CustomSelect, ChunkUploader } from '@choerodon/components';
import { Base64 } from 'js-base64';
import { useHostAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores';
import { mapping } from './stores/hostAppConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

import '../container-config/components/container-detail/index.less';
import StatusDot from '@/components/status-dot';
import { LabelAlignType, LabelLayoutType } from '@/interface';

const jarSource = [
  ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
  productSourceData[5],
];

const Index = observer(() => {
  const {
    HostAppConfigDataSet,
    cRef,
    detail,
  } = useHostAppConfigStore();

  const setData = (data: any) => {
    const newData = data;
    newData.prodJarInfoVO = {
      [mapping.projectProductRepo.name as string]: newData[
        mapping.projectProductRepo.name as string]?.repositoryId,
      [mapping.groupId.name as string]: newData[mapping.groupId.name as string],
      [mapping.artifactId.name as string]: newData[mapping.artifactId.name as string],
      [mapping.jarVersion.name as string]: newData[mapping.jarVersion.name as string],
    };
    newData[mapping.value.name as string] = Base64.encode(newData[mapping.value.name as string]);
    newData.deployObjectId = newData[
      mapping.marketServiceVersion.name as string]?.marketServiceDeployObjectVO?.id;
    return newData;
  };

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
            <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
              <Select name={mapping.nexus.name} />
              <Select name={mapping.projectProductRepo.name} />
              <Select name={mapping.groupId.name} />
              <Select name={mapping.artifactId.name} />
              <Select name={mapping.jarVersion.name} />
            </Form>
          );
        }
        case productSourceData[1].value: case productSourceData[2].value: {
          return (
            <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
              <Select name={mapping.marketAppVersion.name} />
              <Select name={mapping.marketServiceVersion.name} />
            </Form>
          );
        }
        case productSourceData[5].value: {
          return (
            <Form className="c7ncd-appCenterPro-conDetail__form">
              <ChunkUploader
                callbackWhenLoadingChange={(loadingIf: boolean) => {
                  console.log(loadingIf);
                  // modal.update({
                  //   okProps: {
                  //     disabled: loadingIf,
                  //   },
                  // });
                }}
                // disabled={!ImportFileDataSet?.current?.get(mapping().folderId.name)}
                suffix=".jar"
                accept=".jar"
                prefixPatch="/hfle"
                showUploadList={false}
                callback={(str: string) => {
                  console.log(str);
                }}
              />
              {/* <Upload> */}
              {/*  <Button icon="file_upload"> */}
              {/*    上传文件 */}
              {/*  </Button> */}
              {/* </Upload> */}
            </Form>
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
        name={mapping.appCode.name}
      />
    </>
  );

  return (
    <div className="c7ncd-appCenterPro-hostAppConfig">
      <Form columns={3} dataSet={HostAppConfigDataSet}>
        {
          renderDetailForm()
        }
        <Select
          name={mapping.host.name}
          optionRenderer={renderHostOption}
          onOption={({ record: hostRecord }) => ({
            disabled: !hostRecord.get('connect'),
          })}
        />
      </Form>
      {
        detail ? (
          <Form
            columns={3}
            dataSet={HostAppConfigDataSet}
            labelLayout={'horizontal' as LabelLayoutType}
            labelAlign={'left' as LabelAlignType}
          >
            <Output name={mapping.jarSource.name} />
          </Form>
        ) : (
          <div className="c7ncd-appCenterPro-conDetail__productType">
            <CustomSelect
              onClickCallback={
                (value) => HostAppConfigDataSet.current.set(mapping.jarSource.name, value.value)
              }
              selectedKeys={HostAppConfigDataSet.current.get(mapping.jarSource.name)}
              data={jarSource}
              identity="value"
              mode="single"
              customChildren={(item) => (
                <div className="c7ncd-appCenterPro-conDetail__productSource__item">
                  <img src={item.img} alt="" />
                  <p>
                    {item.name}
                  </p>
                </div>
              )}
            />
          </div>
        )
      }
      { renderFormByProductSource() }
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
