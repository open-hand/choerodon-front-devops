/* eslint-disable max-len */
/* eslint-disable react/require-default-props */
import React, { FC, useMemo, useEffect } from 'react';
import {
  Form, SelectBox, useModal, DataSet, TextField,
} from 'choerodon-ui/pro';
import { useFormatCommon, CONSTANTS } from '@choerodon/master';
import type { modalChildrenProps } from 'choerodon-ui/pro/lib/modal/interface';

import { map, isEmpty } from 'lodash';
import useFormatAppPipelineEdit from '../../../../hooks/useFormatAppPipelineEdit';
import { STAGE_CD, STAGE_CI } from '../../../../stores/CONSTANTS';
import addStageDataSet from './addStageDataSet';
import { STAGE_TYPES } from '../../../../interface';

const { Option } = SelectBox;

type StageModalTypes = 'create' | 'edit';

type StageModalOptions<R> = {
  onOk?: (data: R) => void
  onCancel?: (data: R) => void
  initialValue?: R | Record<string, any>
}

function StageModal<T>(props:{
  modal?: modalChildrenProps
  type?: StageModalTypes
  options?:StageModalOptions<T>
}) {
  const {
    modal,
    type,
    options = {},
  } = props;

  const {
    initialValue = {},
    onOk = () => {},
  } = options;

  const stageDs = useMemo(() => new DataSet(addStageDataSet()), []);

  const handleOk = async () => {
    try {
      const isValid = await stageDs.validate();
      if (isValid) {
        onOk(stageDs.current?.toData() || {});
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error);
    }
  };

  modal?.handleOk(handleOk);

  useEffect(() => {
    if (!isEmpty(initialValue)) {
      stageDs.loadData([initialValue]);
    }
  }, []);

  const renderOpts = () => map([STAGE_CI, STAGE_CD], (value: STAGE_TYPES) => {
    const disabeld = initialValue?.type ? initialValue?.type !== value : false;
    return <Option disabled={disabeld} value={value}>{value}</Option>;
  });

  return (
    <Form dataSet={stageDs}>
      <SelectBox name="type">
        {renderOpts()}
      </SelectBox>
      <TextField name="name" />
    </Form>
  );
}

function useStageModal<T>(type: StageModalTypes = 'create', options?: StageModalOptions<T>): () => void {
  const Modal = useModal();

  const formatPipelineEdit = useFormatAppPipelineEdit();
  const formatCommon = useFormatCommon();

  const isEdit = type === 'edit';

  const handleModalOpen = () => {
    Modal.open({
      title: !isEdit ? '添加阶段' : '编辑阶段',
      children: <StageModal<T> options={options} type={type} />,
      style: {
        width: CONSTANTS.MODAL_WIDTH.MIN,
      },
      drawer: true,
      okText: formatCommon({ id: isEdit ? 'modify' : 'create' }),
    });
  };

  return handleModalOpen;
}

export default useStageModal;
