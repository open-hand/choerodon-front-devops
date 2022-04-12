import React, { ReactElement, useImperativeHandle } from 'react';
import {
  Form, SelectBox, TextField, Select,
} from 'choerodon-ui/pro';
import { CustomSelect } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import StatusDot from '@/components/status-dot';
import { useAppInfoStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info/stores';
import { mapping, deployModeOptionsData, deployProductOptionsData } from './stores/appInfoDataSet';

import './index.less';

const Index = observer(() => {
  const {
    AppInfoDataSet,
    cRef,
    isDeploy,
  } = useAppInfoStore();

  useImperativeHandle(cRef, () => ({
    // eslint-disable-next-line no-return-await
    handleOk: async () => {
      AppInfoDataSet.current.setState('checkEnv', true);
      const flag = await AppInfoDataSet.validate();
      if (flag) {
        return AppInfoDataSet.current.toData();
      }
      return flag;
    },
    handleInit: (data: object) => {
      AppInfoDataSet.current.setState('checkEnv', false);
      if (data) {
        AppInfoDataSet.loadData([data]);
      }
    },
  }));

  const handleChangeField = (ds: any, field: string, value: string) => {
    ds.current.set(field, value);
  };

  const renderEnvOption = ({ record, text }: any) => (
    <>
      <StatusDot
        // @ts-ignore
        connect={record.get('connect')}
        synchronize={record.get('synchro')}
        active={record.get('active')}
        size="small"
      />
      <span
        className="c7ncd-appCenterPro-appConfig__env__text"
      >
        {text}
      </span>
    </>
  );

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

  return (
    <Form className="c7ncd-appCenterPro-appInfo__form" columns={3} dataSet={AppInfoDataSet}>
      <TextField colSpan={1} name={mapping.appName.name} />
      <TextField colSpan={1} name={mapping.appCode.name} />
      {/* @ts-ignore */}
      <p newLine className="c7ncd-appCenterPro-appInfo__form__title">
        部署模式
      </p>
      <div
        className="c7ncd-appCenterPro-appInfo__form__selectContainer"
        // @ts-ignore
        colSpan={
          isDeploy ? 1 : 2
        }
        newLine
      >
        <CustomSelect
          selectedKeys={AppInfoDataSet.current.get(mapping.deployMode.name)}
          onClickCallback={(value) => handleChangeField(
            AppInfoDataSet,
            mapping.deployMode.name as string,
            value.value,
          )}
          data={deployModeOptionsData.filter((option) => {
            if (isDeploy && option.value === deployModeOptionsData[1].value) {
              return false;
            }
            return true;
          })}
          identity="value"
          mode="single"
          customChildren={(item): any => (
            <div className="c7ncd-appCenterPro-appInfo__form__customItem">
              <img src={item.img} alt="" />
              <div className="c7ncd-appCenterPro-appInfo__form__customItem--right">
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__name">{item.name}</p>
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__des">{item.description}</p>
              </div>
            </div>
          )}
        />
      </div>
      {
        AppInfoDataSet.current.get(mapping.deployMode.name) === deployModeOptionsData[0].value ? (
          <Select
            newLine
            name={mapping.env.name}
            colSpan={1}
            optionRenderer={renderEnvOption}
            onOption={({ record }) => ({
              disabled: !(record.get('connect') && record.get('synchro') && record.get('permission')),
            })}
          />
        ) : (
          <Select
            newLine
            name={mapping.host.name}
            optionRenderer={renderHostOption}
            onOption={({ record: hostRecord }) => ({
              disabled: !hostRecord.get('connect'),
            })}
          />
        )
      }
      <p
        className="c7ncd-appCenterPro-appInfo__form__title"
        // @ts-ignore
        newLine
      >
        应用类型
      </p>
      <div
        className="c7ncd-appCenterPro-appInfo__form__selectContainer"
        // @ts-ignore
        colSpan={AppInfoDataSet.current.get(mapping.deployMode.name)
        === deployModeOptionsData[0].value ? 2 : 3}
        newLine
      >
        <CustomSelect
          selectedKeys={AppInfoDataSet.current.get(mapping.deployProductType.name)}
          onClickCallback={(value) => handleChangeField(
            AppInfoDataSet,
            mapping.deployProductType.name as string,
            value.value,
          )}
          data={
            AppInfoDataSet.current.get(mapping.deployMode.name) === deployModeOptionsData[0].value
              ? deployProductOptionsData.slice(0, 2)
              : [...deployProductOptionsData.slice(2, 4),
                deployProductOptionsData[5],
                deployProductOptionsData[4]]
          }
          identity="value"
          mode="single"
          customChildren={(item): any => (
            <div className="c7ncd-appCenterPro-appInfo__form__customItem">
              <div className="c7ncd-appCenterPro-appInfo__form__customItem--right">
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__name">{item.name}</p>
                <p className="c7ncd-appCenterPro-appInfo__form__customItem--right__des">{item.description}</p>
              </div>
            </div>
          )}
        />
      </div>

    </Form>
  );
});

export default Index;
