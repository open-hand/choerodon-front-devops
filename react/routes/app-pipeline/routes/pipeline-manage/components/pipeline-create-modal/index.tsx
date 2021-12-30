import React, {
  FC, useMemo, useState,
} from 'react';
import { useFormatCommon, useFormatMessage, CONSTANTS } from '@choerodon/master';
import {
  useModal, TextField, Form, Select,
} from 'choerodon-ui/pro';
import { modalChildrenProps } from 'choerodon-ui/pro/lib/modal/interface';
import { observer } from 'mobx-react-lite';
import { NewTips } from '@choerodon/components';
import { useSessionStorageState } from 'ahooks';
import { useHistory, useLocation } from 'react-router';
import PipeBasicInfoDs from './stores/PipelineBasicInfoDataSet';
import AppServiceDataSet from '@/routes/app-pipeline/stores/AppServiceDataSet';
import BranchDataSet from '@/routes/app-pipeline/stores/BranchDataSet';

import './index.less';
import { DataSet } from '@/interface';
import TemplatesSelector from './components/templates-selector';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';

export type PipelineCreateModalProps = {
  modal?:modalChildrenProps
}

const prefixCls = 'c7ncd-pipeline-create-modal';
const intlPrefix = 'c7ncd.pipeline.create.modal';

const PipelineCreateModal:FC<PipelineCreateModalProps> = observer((props) => {
  const { modal } = props;

  const branchDs = useMemo(() => new DataSet(
    BranchDataSet(),
  ), []);

  const appServiceDs = useMemo(() => new DataSet(
    AppServiceDataSet(),
  ), []);

  const pipelinBasicInfoDs = useMemo(() => new DataSet(
    PipeBasicInfoDs({
      appServiceDs, branchDs,
    }),
  ), [appServiceDs, branchDs]);

  const formatCommon = useFormatCommon();
  const formatPipelineCreateModal = useFormatMessage(intlPrefix);

  const history = useHistory();

  const {
    pathname,
    search,
  } = useLocation();

  const [, setPipelineCreateData] = useSessionStorageState(PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY);

  const [
    submitTmpId,
    setSubmitTmpId,
  ] = useState<any>(null);

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

  const renderForm = () => (
    <Form
      columns={3}
      dataSet={pipelinBasicInfoDs}
      className={`${prefixCls}-form`}
    >
      <TextField name="pipelineName" colSpan={1} />
      <Select
        name="appService"
        searchable
        searchMatcher="name"
        popupCls={`${prefixCls}-project`}
        colSpan={1}
        addonAfter={<NewTips helpText="此处仅能看到您有开发权限的启用状态的应用服务，并要求该应用服务未有关联的流水线" />}
      />
      <Select
        multiple
        name="branch"
        addonAfter={getBranchTips}
        searchable
        searchMatcher="params"
        colSpan={1}
        disabled={!pipelinBasicInfoDs.current?.get('appService')}
      />
    </Form>
  );

  /**
   * 提交创建零时数据存储再session中
   */
  const hanldeSubmit = async () => {
    try {
      const isValid = await pipelinBasicInfoDs.validate();
      if (isValid) {
        const sumitData:any = {
          ...pipelinBasicInfoDs.current?.toData(),
        };
        setPipelineCreateData(sumitData);
        modal?.close();
        history.push({
          pathname: `${pathname}/edit/create/${submitTmpId}`,
          search,
        });
        return true;
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  };

  /**
   *
   * 选中模板的回调函数，主要是为了获取数据
   * @param {*} templateData
   */
  const handleSelectTmpCallback = (templateData:any) => {
    setSubmitTmpId(templateData);
  };

  modal?.handleOk(hanldeSubmit);

  return (
    <div className={prefixCls}>
      {renderForm()}
      <TemplatesSelector handleSelectTmpCallback={handleSelectTmpCallback} />
    </div>
  );
});

const usePipelineCreateModal = () => {
  const Modal = useModal();

  const handleModalOpen = () => {
    Modal.open({
      title: '创建流水线',
      children: <PipelineCreateModal />,
      className: `${prefixCls}-container`,
      style: {
        width: CONSTANTS.MODAL_WIDTH.MIDDLE,
      },
      drawer: true,
    });
  };

  return handleModalOpen;
};

export {
  usePipelineCreateModal,
};

export default PipelineCreateModal;
