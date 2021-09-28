/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  Form, TextField, Button, SelectBox, NumberField, Select,
} from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { Icon, Upload, Button as OldButton } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { CustomSelect, ChunkUploader, NewTips } from '@choerodon/components';
import { productTypeData, productSourceData, mapping, repoTypeData } from '../../stores/conGroupDataSet';
import { mapping as portMapping } from '../../stores/portConfigDataSet';
import { Record, FuncType } from '@/interface';
import CollapseContainer from '../../../deploy-group-config/components/collapse-container';

import './index.less';

const Index = inject('AppState')(observer(({
  className,
  dataSource,
  AppState: { currentMenuType: { organizationId } },
  isPipeline,
}: {
  className?: string;
  dataSource: Record
  AppState?: any,
  isPipeline?: Boolean,
}) => {
  const [imageSource, setImageSource] = useState(JSON.parse(JSON.stringify(productSourceData)).splice(0, 5));
  const [jarSource, setJarSource] = useState([
    ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
    productSourceData[5],
  ])

  useEffect(() => {
    if (isPipeline) {
      setImageSource([
        productSourceData[6],
        ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 5)
      ]);
      setJarSource([
        productSourceData[6],
        ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
        productSourceData[5],
      ])
    }
  }, []);

  const renderFormByProductSource = () => {
    if (dataSource) {
      switch (dataSource.get(mapping.productType.name)) {
        case productTypeData[0].value: {
          switch (dataSource.get(mapping.productSource.name)) {
            case productSourceData[0].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
                  <Select name={mapping.projectImageRepo.name} />
                  <Select name={mapping.image.name} />
                  <Select name={mapping.imageVersion.name} />
                </Form>
              );
              break;
            }
            case productSourceData[1].value: case productSourceData[2].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
                  <Select name={mapping.marketAppVersion.name} />
                  <Select name={mapping.marketServiceVersion.name} />
                </Form>
              );
              break;
            }
            case productSourceData[3].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
                  <Select name={mapping.shareAppService.name} />
                  <Select name={mapping.shareServiceVersion.name} />
                </Form>
              );
              break;
            }
            case productSourceData[4].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={2} record={dataSource}>
                  <TextField name={mapping.repoAddress.name} />
                  <div className="c7ncd-appCenterPro-conDetail__form__col">
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <TextField
                        name={mapping.imageVersion.name}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        marginLeft: 20,
                      }}
                    >
                      <SelectBox
                        name={mapping.repoType.name}
                      />
                    </div>
                  </div>
                  {
                    dataSource.get(mapping.repoType.name) === repoTypeData[0].value && (
                      <>
                        <TextField name={mapping.username.name} />
                        <TextField name={mapping.password.name} />
                      </>
                    )
                  }
                </Form>
              );
              break;
            }
            case productSourceData[6].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
                  <Select
                    colSpan={3}
                    name={mapping.relativeMission.name}
                    addonAfter={<NewTips helpText="此处的关联构建任务，仅会查询出该条流水线中存在'Docker构建'步骤的“构建类型”任务。
                    若所选任务中存在多个“Docker构建”步骤，则只会部署第一个“Docker构建”步骤产生的镜像" />}
                  />
                </Form>
              )
              break;
            }
            default: {
              return '';
              break;
            }
          }
        }
        case productTypeData[1].value: {
          switch (dataSource.get(mapping.productSource.name)) {
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
                <>
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
                      combineUrl={`${window._env_.API_HOST}/hfle/v1/${organizationId}/upload/fragment-combine`}
                      // disabled={!ImportFileDataSet?.current?.get(mapping().folderId.name)}
                      suffix=".jar"
                      paramsData={{
                        bucketName: 'devops-service',
                      }}
                      accept=".jar"
                      prefixPatch="/hfle"
                      showUploadList
                      onSuccess={(res, file) => {
                        dataSource.set(mapping.fileName.name, file.name);
                      }}
                      callback={(str: string) => {
                        dataSource.set(mapping.jarFileDownloadUrl.name as string, str);
                      }}
                    >
                      <OldButton
                        type="dashed"
                        icon="file_upload_black-o"
                      >上传文件</OldButton>
                    </ChunkUploader>
                  </Form>
                  { dataSource.get(mapping.jarFileDownloadUrl.name) && (
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
                          dataSource.set(mapping.jarFileDownloadUrl.name, '');
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
            case productSourceData[6].value: {
              return (
                <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
                  <Select
                    colSpan={3}
                    name={mapping.relativeMission.name}
                    addonAfter={<NewTips helpText="此处的关联构建任务，仅会查询出该条流水线中存在“上传jar包至制品库”或“Maven发布”步骤的“构建类型”任务。
                    若所选任务中存在多个满足条件的步骤，则只会部署所选任务中第一个满足条件的步骤产生的jar包" />}
                  />
                </Form>
              )
              break;
            }
            default: {
              return '';
            }
          }
        }
        default: {
          return '';
        }
      }
    }
    return '';
  };

  const renderPortConfig = () => {
    if (dataSource) {
      switch (dataSource.get(mapping.productType.name)) {
        case productTypeData[0].value: {
          switch (dataSource.get(mapping.productSource.name)) {
            case productSourceData[0].value: {
              return (
                <CollapseContainer
                  style={{
                    marginBottom: 20,
                  }}
                  helpText="用于设置容器的访问策略"
                  title="端口配置"
                  content={getPortConfigRender()}
                />
              );
            }
            default: {
              return '';
            }
          }
        }
        case productTypeData[1].value: {
          switch (dataSource.get(mapping.productSource.name)) {
            case productSourceData[1].value: case productSourceData[5].value: {
              return (
                <CollapseContainer
                  style={{
                    marginBottom: 20,
                  }}
                  title="端口配置"
                  content={getPortConfigRender()}
                />
              );
            }
            default: {
              return '';
            }
          }
        }
        default: {
          return '';
        }
      }
    }
    return '';
  };

  const handleChangeRecord = (key: string, value: string) => {
    dataSource.set(key, value);
  };

  const getEnvVariableRender = () => {
    if (dataSource) {
      return (
        <Form className="c7ncd-appCenterPro-conDetail__nestForm" columns={2}>
          {
            dataSource
              ?.getField(mapping.enVariable.name)?.options?.records.map((record: Record) => (
                <Form record={record}>
                  <div className="c7ncd-appCenterPro-conDetail__form__col">
                    <TextField name="key" />
                    <span style={{ margin: '0 3px' }}>=</span>
                    <TextField name="value" />
                    {
                      (dataSource
                        ?.getField(mapping.enVariable.name)
                        ?.options?.records?.length || 0) > 1 && (
                        <Icon
                          type="delete"
                          style={{
                            marginLeft: 7,
                            color: '#5365ea',
                          }}
                          onClick={() => dataSource
                            ?.getField(mapping.enVariable.name)?.options?.delete([record], false)}
                        />
                      )
                    }
                  </div>
                </Form>
              ))
          }
          <Button
            funcType={'flat' as FuncType}
            icon="add"
            style={{
              width: 'auto',
              position: 'relative',
              top: 10,
            }}
            onClick={() => dataSource?.getField(mapping.enVariable.name)?.options?.create()}
          >
            添加环境变量
          </Button>
        </Form>
      );
    }
    return '';
  };

  const getPortConfigRender = () => {
    if (dataSource) {
      if (dataSource?.getField && dataSource?.getField(mapping.portConfig.name)?.options) {
        return (
          <Form className="c7ncd-appCenterPro-conDetail__nestForm" columns={2}>
            {
              dataSource
                ?.getField(mapping.portConfig.name)?.options?.records.map((record: Record) => (
                  <>
                    <Form columns={4} record={record}>
                      <Select className="c7ncd-appCenterPro-conDetail__portConfig__form__select" name={portMapping.agreement.name} />
                      <TextField className="c7ncd-appCenterPro-conDetail__portConfig__form__select" name={portMapping.name.name} />
                      <NumberField className="c7ncd-appCenterPro-conDetail__portConfig__form__select" name={portMapping.port.name} />
                      {
                        (dataSource
                          ?.getField(mapping.portConfig.name)
                          ?.options?.records?.length || 0) > 1 && (
                          <Icon
                            type="delete"
                            style={{
                              color: '#5365ea',
                            }}
                            onClick={() => dataSource
                              ?.getField(mapping.portConfig.name)?.options?.delete([record], false)}
                          />
                        )
                      }
                    </Form>
                  </>
                ))
            }
            <Button
              funcType={'flat' as FuncType}
              icon="add"
              style={{
                width: 'auto',
                position: 'relative',
                top: 10,
              }}
              onClick={() => dataSource?.getField(mapping.portConfig.name)?.options?.create()}
            >
              添加端口
            </Button>
          </Form>
        );
      }
    }
    return '';
  };

  const getProductSourceData = () => {
    if (dataSource) {
      return dataSource.get(mapping.productType.name) === productTypeData[0].value
        ? imageSource
        : jarSource
    }
    return [{
      value: '',
    }];
  };

  return (
    <div
      className={`c7ncd-appCenterPro-conDetail ${className}`}
    >
      <p>制品类型</p>
      <div className="c7ncd-appCenterPro-conDetail__productType">
        {
          dataSource && (
            <CustomSelect
              onClickCallback={
                (value) => handleChangeRecord((mapping.productType.name as string), value.value)
              }
              selectedKeys={dataSource?.get(mapping.productType.name)}
              data={productTypeData}
              identity="value"
              mode="single"
              customChildren={(item): any => (
                <div className="c7ncd-appCenterPro-conDetail__productType__item">
                  <img src={item.img} alt="" />
                  <span>
                    {item.name}
                  </span>
                </div>
              )}
            />
          )
        }
      </div>
      <p style={{ marginTop: 20 }}>
        {
          dataSource?.get(mapping.productType.name) === productTypeData[0].value ? '镜像来源' : 'jar包来源'
        }
      </p>
      <div style={{ flexWrap: 'wrap' }} className="c7ncd-appCenterPro-conDetail__productType">
        {
          dataSource && (
            <CustomSelect
              onClickCallback={
                (value) => handleChangeRecord((mapping.productSource.name as string), value.value)
              }
              selectedKeys={dataSource?.get(mapping.productSource.name)}
              data={getProductSourceData()}
              identity="value"
              mode="single"
              customChildren={(item, index): any => (
                <div
                  className="c7ncd-appCenterPro-conDetail__productSource__item"
                  style={{
                    marginTop: isPipeline && index > 4 ? 20 : 'unset',
                  }}
                >
                  <img src={item.img} alt="" />
                  <p>
                    {item.name}
                  </p>
                </div>
              )}
            />
          )
        }
      </div>
      { renderFormByProductSource() }
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        title="配置管理"
        content={(
          <Form columns={4} record={dataSource}>
            <NumberField addonAfter="m" name={mapping.CPUReserved.name} />
            <NumberField addonAfter="m" name={mapping.CPULimit.name} />
            <NumberField addonAfter="Mi" name={mapping.memoryReserved.name} />
            <NumberField addonAfter="Mi" name={mapping.memoryLimit.name} />
          </Form>
        )}
      />
      {
        renderPortConfig()
      }
      <CollapseContainer
        title="环境变量"
        content={getEnvVariableRender()}
      />
    </div>
  );
}));

Index.defaultProps = {
  className: '',
};

export default Index;
