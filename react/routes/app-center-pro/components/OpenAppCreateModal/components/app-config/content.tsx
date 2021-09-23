import React, {
  ReactDOM, ReactElement, useEffect, useImperativeHandle, useMemo,
} from 'react';
import {
  Form, Select, TextField, Output,
} from 'choerodon-ui/pro';
import _ from 'lodash';
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

  const getValues = async (chartSource: string | undefined, detailData: any) => {
    switch (chartSource) {
      case (chartSourceData[0].value): case (chartSourceData[1].value): {
        const res = await appServiceInstanceApi
          .getValues(
            detailData.instanceId || detailData.id,
            detailData.appServiceVersionId || detailData.commandVersionId,
          );
        return res;
      }
      default: {
        const res = await appServiceInstanceApi
          .getMarketValues(detailData.instanceId || detailData.id, detailData.appServiceVersionId);
        return res;
      }
    }
  };

  useEffect(() => {
    async function init() {
      if (typeof (detail) === 'object') {
        const res = await getValues(detail?.chartSource || detail?.source, detail);
        AppConfigDataSet.loadData([{
          ...detail,
          [mapping.chartSource.name as string]: detail?.chartSource || detail?.source,
          [mapping.value.name as string]: res.yaml,
          [mapping.originValue.name as string]: res.yaml,
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
            onOption={({ record }) => {
              let groupName;
              if (detail) {
                const optionsData = AppConfigDataSet
                  .current?.getField(mapping.marketVersion.name)?.options?.toData();
                const selected: any = optionsData
                  && optionsData
                    .find(
                      (item: any) => String(item?.versionId)
                        === String((detail as any)?.mktAppVersionId),
                    );
                groupName = selected && selected.name;
              }
              return ({
                disabled: groupName ? record.get('name') !== groupName : false,
              });
            }}
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
      <span
        className="c7ncd-appCenterPro-appConfig__env__text"
      >
        {text}
      </span>
    </>
  );

  const Editor = (
    <YamlEditor
      readOnly={false}
      value={AppConfigDataSet.current.get(mapping.value.name)}
      originValue={AppConfigDataSet.current.get(mapping.originValue.name)}
      onValueChange={(value: string) => AppConfigDataSet.current.set(mapping.value.name, value)}
    />
  );

  return (
    <div className="c7ncd-appCenterPro-appConfig">
      {
        detail ? (
          ''
        ) : (
          <div className="c7ncd-appCenterPro-appConfig__selectContainer">
            <CustomSelect
              onClickCallback={(value) => handleChangeField(
                AppConfigDataSet,
                mapping.chartSource.name as string,
                value.value,
              )}
              selectedKeys={AppConfigDataSet.current.get(mapping.chartSource.name)}
              data={chartSourceData.slice(0, 4)}
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
          detail ? [
            <TextField
              name={mapping.appName.name}
            />,
            <TextField
              disabled
              name={mapping.appCode.name}
            />,
            <Select
              name={mapping.chartSource.name}
              disabled
            />,
          ] : ''
        }
        {
          renderAppService(AppConfigDataSet)
        }
        {
          renderVersion(AppConfigDataSet)
        }
        {
          detail ? (
            <Select
              name={mapping.env.name}
              colSpan={1}
              disabled={Boolean(detail)}
              optionRenderer={renderEnvOption}
              onOption={({ record }) => ({
                disabled: !(record.get('connect') && record.get('synchro') && record.get('permission')),
              })}
            />
          ) : ''
        }

      </Form>
      {Editor}
    </div>
  );
});

export default Index;
