/* eslint-disable max-len */
import React, {
  useEffect, FC, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import {
  DataSet, TextField, Form, Select,
} from 'choerodon-ui/pro';
import { useUnmount, useMount } from 'ahooks';
import { NewTips } from '@choerodon/components';
import { isEmpty } from 'lodash';

import PipeBasicInfoDs from './stores/PipelineBasicInfoDataSet';
import AppServiceDataSet from '@/routes/app-pipeline/stores/AppServiceDataSet';
import BranchDataSet from '@/routes/app-pipeline/stores/BranchDataSet';

import useTabData from '../../hooks/useTabData';

import './index.less';

export type PipelineBasicInfoProps = {
}

type BasicInfoDataProps = {
  appService: {
    appServiceId:string,
    [fields:string]:any
  }
  branch: string[]
  pipelineName:string
}

const prefixCls = 'c7ncd-pipeline-basic-info' as const;
const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

const PipelineBasicInfo:FC<PipelineBasicInfoProps> = (props) => {
  const [savedData, setData] = useTabData<BasicInfoDataProps>();

  const formatCommon = useFormatCommon();
  const formatPipelineEdit = useFormatMessage(intlPrefix);

  const branchDs = useMemo(() => new DataSet(
    BranchDataSet(),
  ), []);

  const appServiceDs = useMemo(() => new DataSet(
    AppServiceDataSet(),
  ), []);

  const pipelinBasicInfoDs = useMemo(() => new DataSet(
    PipeBasicInfoDs({
      formatPipelineEdit, appServiceDs, branchDs, setData,
    }),
  ), [appServiceDs, branchDs]);

  const getBranchTips = useMemo(() => (
    <NewTips helpText={(
      <div>
        <p>仅会在关联分支上创建流水线，即后续仅能在关联分支或基于关联分支创建出来的分支上执行流水线；</p>
        <p>此处最多可选择5个分支，建议您选择为maser等长期存在的分支；</p>
        <p>且此处为必选，若应用服务中没有分支，则无法创建流水线。</p>
      </div>
    )}
    />
  ), []);

  useMount(() => {
    if (!isEmpty(savedData)) {
      pipelinBasicInfoDs.loadData([savedData]);
    }
  });

  useUnmount(() => {
    setData(pipelinBasicInfoDs.current?.toData());
  });

  return (
    <div className={prefixCls}>
      <Form dataSet={pipelinBasicInfoDs} className={`${prefixCls}-form`}>
        <TextField name="pipelineName" />
        <Select
          name="appService"
          searchable
          searchMatcher="appServiceName"
          popupCls={`${prefixCls}-project`}
          addonAfter={<NewTips helpText="此处仅能看到您有开发权限的启用状态的应用服务，并要求该应用服务未有关联的流水线" />}
        />
        <Select
          multiple
          name="branch"
          addonAfter={getBranchTips}
          searchable
          searchMatcher="params"
          disabled={!pipelinBasicInfoDs.current?.get('appService')}
        />
      </Form>
    </div>
  );
};

export default observer(PipelineBasicInfo);
