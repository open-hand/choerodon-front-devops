import React from 'react';
import {
  Form, TextField, Button, SelectBox, NumberField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { CustomSelect } from '@choerodon/components';
import { productTypeData, productSourceData, mapping } from '../../stores/conGroupDataSet';
import { Record } from '@/interface';
import CollapseContainer from '../../../deploy-group-config/components/collapse-container';

import './index.less';

const Index = observer(({
  className,
  dataSource,
}: {
  className?: string;
  dataSource: Record
}) => {
  const renderFormByProductSource = () => {
    if (dataSource) {
      switch (dataSource.get(mapping.productSource.name)) {
        case productSourceData[0].value: {
          return (
            <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
              <TextField name={mapping.projectImageRepo.name} />
              <TextField name={mapping.image.name} />
              <TextField name={mapping.imageVersion.name} />
            </Form>
          );
          break;
        }
        case productSourceData[1].value: case productSourceData[2].value: {
          return (
            <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
              <TextField name={mapping.marketAppVersion.name} />
              <TextField name={mapping.marketServiceVersion.name} />
            </Form>
          );
          break;
        }
        case productSourceData[3].value: {
          return (
            <Form className="c7ncd-appCenterPro-conDetail__form" columns={3} record={dataSource}>
              <TextField name={mapping.shareAppService.name} />
              <TextField name={mapping.shareServiceVersion.name} />
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
    return '';
  };

  const handleChangeRecord = (key: string, value: string) => {
    dataSource.set(key, value);
  };

  return (
    <div
      className={`c7ncd-appCenterPro-conDetail ${className}`}
    >
      <p>制品类型</p>
      <div className="c7ncd-appCenterPro-conDetail__productType">
        <CustomSelect
          onClickCallback={(value) => console.log(value)}
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
      </div>
      <p style={{ marginTop: 20 }}>镜像来源</p>
      <div className="c7ncd-appCenterPro-conDetail__productType">
        <CustomSelect
          onClickCallback={
            (value) => handleChangeRecord((mapping.productSource.name as string), value.value)
          }
          data={productSourceData}
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
      { renderFormByProductSource() }
      <CollapseContainer
        title="配置管理"
        content={(
          <Form columns={4} record={dataSource}>
            <NumberField addonAfter="M" name={mapping.CPUReserved.name} />
            <NumberField addonAfter="M" name={mapping.CPULimit.name} />
            <NumberField addonAfter="M" name={mapping.memoryReserved.name} />
            <NumberField addonAfter="M" name={mapping.memoryLimit.name} />
          </Form>
        )}
      />
    </div>
  );
});

Index.defaultProps = {
  className: '',
};

export default Index;
