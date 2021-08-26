import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Select, Button } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { CustomSelect } from '@choerodon/components';
import { useHostAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores';
import { mapping } from './stores/hostAppConfigDataSet';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

import '../container-config/components/container-detail/index.less';

const jarSource = [
  ...JSON.parse(JSON.stringify(productSourceData)).splice(0, 3),
  productSourceData[5],
];

const Index = observer(() => {
  const {
    HostAppConfigDataSet,
  } = useHostAppConfigStore();

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
              <Upload>
                <Button icon="file_upload">
                  上传文件
                </Button>
              </Upload>
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

  return (
    <div className="c7ncd-appCenterPro-hostAppConfig">
      <Form columns={3} dataSet={HostAppConfigDataSet}>
        <Select name={mapping.host.name} />
      </Form>
      <div className="c7ncd-appCenterPro-conDetail__productType">
        <CustomSelect
          onClickCallback={
            (value) => HostAppConfigDataSet.current.set(mapping.jarSource.name, value.value)
          }
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
      { renderFormByProductSource() }
    </div>
  );
});

export default Index;
