import React, { ReactElement, useImperativeHandle } from 'react';
import { Form, Select } from 'choerodon-ui/pro';
import { CustomSelect } from '@choerodon/components';
import { chartSourceData, mapping } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import { useAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores';

import './index.less';

const Index = () => {
  const {
    AppConfigDataSet,
    cRef,
  } = useAppConfigStore();

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await AppConfigDataSet.validate();
      if (flag) {
        return AppConfigDataSet.current.toData();
      }
      return flag;
    },
  }));

  return (
    <div className="c7ncd-appCenterPro-appConfig">
      <p className="c7ncd-appCenterPro-appInfo__form__title">
        Chart包来源
      </p>
      <div className="c7ncd-appCenterPro-appConfig__selectContainer">
        <CustomSelect
          onClickCallback={(value) => console.log(value)}
          data={chartSourceData}
          identity="value"
          mode="single"
          customChildren={(item): ReactElement => (
            <div className="c7ncd-appCenterPro-appConfig__selectContainer__item">
              <img src={item.img} alt="" />
              <p>{item.name}</p>
            </div>
          )}
        />
      </div>
      <Form
        className="c7ncd-appCenterPro-appConfig__form"
        dataSet={AppConfigDataSet}
        columns={3}
      >
        <Select
          name={mapping.hzeroVersion.name}
          colSpan={1}
        />
        <Select
          name={mapping.serviceVersion.name}
          colSpan={1}
        />
        <Select
          name={mapping.env.name}
          colSpan={1}
        />
      </Form>
      <YamlEditor />
    </div>
  );
};

export default Index;
