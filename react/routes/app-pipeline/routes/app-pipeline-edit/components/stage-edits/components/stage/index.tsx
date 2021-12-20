/* eslint-disable max-len */
import React, {
  FC,
} from 'react';
import { useFormatCommon } from '@choerodon/master';
import map from 'lodash/map';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

import JobItem from '../job-item';
import JobAddBtn from '../job-btn';
import { STAGE_TYPES } from '../../../../interface';
import useStageModal from '../../hooks/useStageModal';
import { STAGE_CI } from '../../../../stores/CONSTANTS';
import useStageEdit from '../../hooks/useStageEdit';

export type StageProps = {
  type: STAGE_TYPES
  name: string
  jobList: any[]
  stageIndex:number
} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-stage';

const Stage:FC<StageProps> = (props) => {
  const {
    type = STAGE_CI,
    name,
    jobList = [],
    stageIndex,
  } = props;

  const {
    editStage,
    deleteStage,

    deleteJob,
    addJob,
  } = useStageEdit();

  const formatCommon = useFormatCommon();

  const linesType = type === STAGE_CI ? 'paralle' : 'serial';

  /**
   * 编辑阶段的回调
   * @param {*} stageData
   */
  const handleStageEditOk = (stageData:any) => {
    editStage(stageIndex, stageData);
  };

  /**
   * 删除阶段的回调
   * @param {*} e
   */
  const handleDeleteStage = (e:any) => {
    e?.stopPropagation();
    deleteStage(stageIndex);
  };

  /** @type {*} 打开阶段编辑弹窗 */
  const handleModalOpen = useStageModal<{
    type: STAGE_TYPES
    name: string
  }>('edit', {
    initialValue: {
      type,
      name,
    },
    onOk: handleStageEditOk,
  });

  /**
   * 新增job的回调
   * @param {number} jobIndex
   * @param {*} jobData
   */
  const handleJobAddCallback = (jobData:any) => {
    const jobIndex = jobList.length;
    addJob(stageIndex, jobIndex, jobData);
  };

  /**
   * 删除job的回调
   * @param {number} jobIndex
   * @param {*} jobData
   */
  const handleJobDeleteCallback = (jobIndex:number) => {
    deleteJob(stageIndex, jobIndex);
  };

  const renderJobs = () => map(jobList, (item, index:number) => {
    const options = {
      handleJobDeleteCallback,
    };
    const data = {
      ...item,
      jobIndex: index, // job的index
      linesType,
    };
    return <JobItem {...data} {...options} key={item?.id} />;
  });

  return (
    <div className={prefixCls}>
      <header onClick={handleModalOpen} role="none">
        <div className={`${prefixCls}-stageType`}>{type}</div>
        <div className={`${prefixCls}-stageName`}>{name}</div>
        <div className={`${prefixCls}-btnGroups`}>
          <Icon onClick={handleDeleteStage} type="delete_black-o" className={`${prefixCls}-btnGroups-delete`} />
        </div>
      </header>
      <main>
        {renderJobs()}
      </main>
      <footer>
        <JobAddBtn handleJobAddCallback={handleJobAddCallback} linesType={linesType} type={jobList.length ? 'circle' : 'normal'} />
      </footer>
    </div>
  );
};

export default Stage;
