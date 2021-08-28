import React from 'react';
import {
  Form, TextField, Button, SelectBox, NumberField, Select,
} from 'choerodon-ui/pro';
import { Icon, Upload } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { CustomSelect } from '@choerodon/components';
import { productTypeData, productSourceData, mapping } from '../../stores/conGroupDataSet';
import { mapping as portMapping } from '../../stores/portConfigDataSet';
import { Record, FuncType } from '@/interface';
import CollapseContainer from '../../../deploy-group-config/components/collapse-container';

import './index.less';

const imageSource = JSON.parse(JSON.stringify(productSourceData)).splice(0, 5);
const jarSource = [
  ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
  productSourceData[5],
];

const Index = observer(({
  className,
  dataSource,
}: {
  className?: string;
  dataSource: Record
}) => {
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
                    <TextField
                      name={mapping.imageVersion.name}
                      style={{
                        flex: 1,
                      }}
                    />
                    <SelectBox
                      style={{
                        flex: 1,
                        marginLeft: 20,
                      }}
                      name={mapping.repoType.name}
                    />
                  </div>
                  <TextField name={mapping.username.name} />
                  <TextField name={mapping.password.name} />
                </Form>
              );
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
                <Form className="c7ncd-appCenterPro-conDetail__form">
                  <Upload>
                    <Button icon="file_upload">
                      上传文件
                    </Button>
                  </Upload>
                </Form>
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
        <Form columns={2}>
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
          <Form columns={2}>
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
        : jarSource;
    }
    return [{
      value: '',
    }];
  };

  console.log(dataSource?.get(mapping.productSource.name));

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
              customChildren={(item) => (
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
      <p style={{ marginTop: 20 }}>镜像来源</p>
      <div className="c7ncd-appCenterPro-conDetail__productType">
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
              customChildren={(item) => (
                <div className="c7ncd-appCenterPro-conDetail__productSource__item">
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
});

Index.defaultProps = {
  className: '',
};

export default Index;
