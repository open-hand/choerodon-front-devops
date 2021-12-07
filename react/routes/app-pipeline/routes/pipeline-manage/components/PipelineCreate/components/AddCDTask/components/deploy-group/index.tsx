import React, { useRef, useImperativeHandle, useEffect } from 'react';
import {
  DataSet, Form, TextField, Select,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { mapping } from '../../stores/deployGroupDataSet';
import DeployGroupConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config';
import ContainerConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config';
import { deployAppCenterApi } from '@/api';
import { deployWayData } from '../../stores/addCDTaskDataSetMap';

import './index.less';

const cssPrefix = 'c7ncd-pipelineCreate-deployGroup';

const Index = observer(({
  dataSet,
  cRef,
  detail,
  deployWay,
  preJobList,
  changeDetail,
}: {
  deployWay?: string,
  dataSet: DataSet,
  cRef?: any,
  detail?: {
    appConfig: any,
    name: string,
    code: string,
    containerConfig: any,
  },
  changeDetail?(data: any): void,
  preJobList?: object[],
}) => {
  const deployGroupRef = useRef();
  const containerConfigRef = useRef();

  useEffect(() => {
    if (detail) {
      dataSet.loadData([detail]);
    }
  }, []);

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await dataSet.validate();
      let result: any = false;
      if (flag) {
        const data = await (deployGroupRef?.current as any)?.handleOk();
        if (data) {
          const containerData = await (containerConfigRef?.current as any)?.handleOk();
          if (containerData) {
            result = {
              appConfig: data,
              containerConfig: containerData,
            };
          }
        }
      }
      return result;
    },
  }));

  return (
    <div className={cssPrefix}>
      <p className={`${cssPrefix}__title`}>
        应用信息
      </p>
      <Form dataSet={dataSet} columns={2}>
        {
          deployWay === deployWayData[0].value ? (
            <TextField name={mapping().appName.name} />
          ) : (
            <Select
              name={mapping().appName.name}
              onChange={async (value: string) => {
                if (value) {
                  const id = (dataSet.current?.getField(mapping().appName.name)
                  ?.options?.toData() as any)
                  ?.find((options: any) => options.name === value)?.id;
                  const res = await deployAppCenterApi.loadEnvAppDetail(id);
                  if (changeDetail) {
                    changeDetail(res);
                  }
                }
              }}
            />
          )
        }
        <TextField name={mapping().appCode.name} />
      </Form>
      <div className={`${cssPrefix}__divided`} />
      <p className={`${cssPrefix}__title`}>
        应用配置
      </p>
      <DeployGroupConfig
        customStyle={{
          '.c7ncd-appCenterPro-deployGroup__form': {
            position: 'absolute',
            top: '-60px',
            left: '60px',
          },
        }}
        detail={detail}
        cRef={deployGroupRef}
        isPipeline
      />
      <div className={`${cssPrefix}__divided`} />
      <p className={`${cssPrefix}__title`}>
        容器配置
      </p>
      <ContainerConfig
        detail={detail}
        cRef={containerConfigRef}
        isPipeline
        preJobList={preJobList}
      />
    </div>
  );
});

Index.defaultProps = {
  deployWay: deployWayData[0].value,
};

export default Index;
