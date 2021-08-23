import React, { ReactElement, useImperativeHandle } from 'react';
import { Form, SelectBox, TextField } from 'choerodon-ui/pro';
import { CustomSelect } from '@choerodon/components';
import { useAppInfoStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info/stores';
import { mapping, deployModeOptionsData, deployProductOptionsData } from './stores/appInfoDataSet';

import './index.less';

const Index = () => {
  const {
    AppInfoDataSet,
    cRef,
  } = useAppInfoStore();

  useImperativeHandle(cRef, () => ({
    // eslint-disable-next-line no-return-await
    handleOk: async () => {
      const flag = await AppInfoDataSet.validate();
      if (flag) {
        return AppInfoDataSet.current.toData();
      }
      return flag;
    },
    handleInit: (data: object) => {
      if (data) {
        AppInfoDataSet.loadData([data]);
      }
    },
  }));

  const handleChangeField = (ds: any, field: string, value: string) => {
    ds.current.set(field, value);
  };

  return (
    <Form className="c7ncd-appCenterPro-appInfo__form" columns={2} dataSet={AppInfoDataSet}>
      <TextField colSpan={1} name={mapping.appName.name} />
      <TextField colSpan={1} name={mapping.appCode.name} />
      <p className="c7ncd-appCenterPro-appInfo__form__title">
        部署模式
      </p>
      <div
        className="c7ncd-appCenterPro-appInfo__form__selectContainer"
        // @ts-ignore
        colSpan={2}
        newLine
      >
        <CustomSelect
          onClickCallback={(value) => handleChangeField(
            AppInfoDataSet,
            mapping.deployMode.name,
            value.value,
          )}
          data={deployModeOptionsData}
          identity="value"
          mode="single"
          customChildren={(item): ReactElement => (
            <div className="c7ncd-appCenterPro-appInfo__form__customItem">
              <img src={item.img} alt="" />
              <div className="c7ncd-appCenterPro-appInfo__form__customItem--right">
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__name">{ item.name }</p>
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__des">{ item.description }</p>
              </div>
            </div>
          )}
        />
      </div>
      <p className="c7ncd-appCenterPro-appInfo__form__title">
        部署制品类型
      </p>
      <div
        className="c7ncd-appCenterPro-appInfo__form__selectContainer"
        // @ts-ignore
        colSpan={2}
        newLine
      >
        <CustomSelect
          onClickCallback={(value) => handleChangeField(
            AppInfoDataSet,
            mapping.deployProductType.name,
            value.value,
          )}
          data={deployProductOptionsData}
          identity="value"
          mode="single"
          customChildren={(item): ReactElement => (
            <div className="c7ncd-appCenterPro-appInfo__form__customItem">
              <div className="c7ncd-appCenterPro-appInfo__form__customItem--right">
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__name">{ item.name }</p>
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__des">{ item.description }</p>
              </div>
            </div>
          )}
        />
      </div>
    </Form>
  );
};

export default Index;
