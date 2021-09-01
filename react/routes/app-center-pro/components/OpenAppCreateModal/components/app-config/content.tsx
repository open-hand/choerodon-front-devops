import React, {
  ReactDOM, ReactElement, useEffect, useImperativeHandle,
} from 'react';
import {
  Form, Select, TextField, Output,
} from 'choerodon-ui/pro';
import { CustomSelect } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { chartSourceData, mapping } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';
import YamlEditor from '@/components/yamlEditor';
import { useAppConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores';
import StatusDot from '@/components/status-dot';
import { appServiceInstanceApi } from '@/api';

import './index.less';
import { LabelAlignType, LabelLayoutType } from '@/interface';

const Index = observer(() => {
  const {
    AppConfigDataSet,
    cRef,
    detail,
    modal,
    refresh,
  } = useAppConfigStore();

  const getValues = async (chartSource: string, detailData: any) => {
    switch (chartSource) {
      case (chartSourceData[0].value): case (chartSourceData[1].value): {
        const res = await appServiceInstanceApi
          .getValues(detailData.instanceId, detailData.appServiceVersionId);
        return res;
        break;
      }
      default: {
        const res = await appServiceInstanceApi
          .getMarketValues(detailData.instanceId, detailData.appServiceVersionId);
        return res;
        break;
      }
    }
  };

  useEffect(() => {
    async function init() {
      if (typeof (detail) === 'object') {
        const res = await getValues(detail?.chartSource, detail);
        AppConfigDataSet.loadData([{
          ...detail,
          [mapping.value.name as string]: res.yaml,
          [mapping.marketVersion.name as string]: detail?.mktAppVersionId,
          [mapping.marketServiceVersion.name as string]: detail?.mktDeployObjectId,
        }]);
      }
    }
    init();
  }, []);

  const handleOk = async () => {
    const res = await AppConfigDataSet.submit();
    if (res !== false) {
      if (refresh) {
        refresh();
      }
      return true;
    }
    return false;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

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
      {
        detail ? (
          <Form columns={3} dataSet={AppConfigDataSet}>
            <TextField
              name={mapping.appName.name}
            />
            <TextField
              disabled
              name={mapping.appCode.name}
            />
          </Form>
        ) : (
          <p className="c7ncd-appCenterPro-appInfo__form__title">
            Chart包来源
          </p>
        )
      }
      {
        detail ? (
          <Form
            columns={3}
            dataSet={AppConfigDataSet}
            labelLayout={'horizontal' as LabelLayoutType}
            labelAlign={'left' as LabelAlignType}
          >
            <Output name={mapping.chartSource.name} />
          </Form>
        ) : (
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
        )
      }
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
          disabled={Boolean(detail)}
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
