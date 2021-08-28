import React, { ReactDOM, ReactElement, useImperativeHandle } from 'react';
import { Form, Select } from 'choerodon-ui/pro';
import { CustomSelect } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { chartSourceData, mapping } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import { useAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores';
import StatusDot from '@/components/status-dot';

import './index.less';

const Index = observer(() => {
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
    handleInit: (data: object) => {
      if (data) {
        AppConfigDataSet.loadData([data]);
      }
    },
  }));

  const handleChangeField = (ds: any, name: string, value: string) => {
    ds.current.set(name, value);
  };

  const renderAppService = (ds: any) => {
    switch (ds.current.get(mapping.chartSource.name)) {
      case (chartSourceData[0].value): case (chartSourceData[1].value): {
        return (
          <Select
            name={mapping.hzeroVersion.name}
            colSpan={1}
          />
        );
        break;
      }
      case (chartSourceData[2].value): case (chartSourceData[3].value): {
        return (
          <Select
            name={mapping.marketVersion.name}
            colSpan={1}
          />
        );
        break;
      }
      default: {
        return '';
        break;
      }
    }
  };

  const renderVersion = (ds: any) => {
    switch (ds.current.get(mapping.chartSource.name)) {
      case (chartSourceData[0].value): case (chartSourceData[1].value): {
        return (
          <Select
            name={mapping.serviceVersion.name}
            colSpan={1}
          />
        );
        break;
      }
      case (chartSourceData[2].value): case (chartSourceData[3].value): {
        return (
          <Select
            name={mapping.marketServiceVersion.name}
            colSpan={1}
          />
        );
        break;
      }
      default: {
        return '';
        break;
      }
    }
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
      {text}
    </>
  );

  return (
    <div className="c7ncd-appCenterPro-appConfig">
      <p className="c7ncd-appCenterPro-appInfo__form__title">
        Chart包来源
      </p>
      <div className="c7ncd-appCenterPro-appConfig__selectContainer">
        <CustomSelect
          onClickCallback={(value) => handleChangeField(
            AppConfigDataSet,
            mapping.chartSource.name as string,
            value.value,
          )}
          selectedKeys={AppConfigDataSet.current.get(mapping.chartSource.name)}
          data={chartSourceData}
          identity="value"
          mode="single"
          customChildren={(item): any => (
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
        {
          renderAppService(AppConfigDataSet)
        }
        {
          renderVersion(AppConfigDataSet)
        }
        <Select
          name={mapping.env.name}
          colSpan={1}
          optionRenderer={renderEnvOption}
          onOption={({ record }) => ({
            disabled: !(record.get('connect') && record.get('synchro') && record.get('permission')),
          })}
        />
      </Form>
      <YamlEditor
        readOnly={false}
        value={AppConfigDataSet.current.get(mapping.value.name)}
        onValueChange={(value: string) => AppConfigDataSet.current.set(mapping.value.name, value)}
      />
    </div>
  );
});

export default Index;
