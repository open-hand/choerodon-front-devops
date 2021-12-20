import React, {
  useEffect, FC,
} from 'react';
import { useFormatCommon } from '@choerodon/master';
import map from 'lodash/map';
import {} from '@choerodon/components';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

import JobItem from '../job-item';
import JobAddBtn from '../job-btn';
import { STAGE_TYPES } from '../../../../interface';
import useStageModal from '../../hooks/useStageModal';
import { STAGE_CI } from '../../../../stores/CONSTANTS';
import { useStageEditsStore } from '../../stores';
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
  } = useStageEdit();

  const formatCommon = useFormatCommon();

  const initData = {
    type,
    name,
  };

  const handleOk = (stageData:any) => {
    editStage(stageIndex, stageData);
  };

  const handleDelete = (e:any) => {
    e?.stopPropagation();
    deleteStage(stageIndex);
  };

  const handleModalOpen = useStageModal<{
    type: STAGE_TYPES
    name: string
  }>('edit', { initialValue: initData, onOk: handleOk });

  const renderJobs = () => map(jobList, (item, index:number) => {
    const linesType = type === STAGE_CI ? 'paralle' : 'serial';
    return <JobItem {...item} key={item?.id} linesType={linesType} />;
  });

  return (
    <div className={prefixCls}>
      <header onClick={handleModalOpen} role="none">
        <div className={`${prefixCls}-stageType`}>{type}</div>
        <div className={`${prefixCls}-stageName`}>{name}</div>
        <div className={`${prefixCls}-btnGroups`}>
          <Icon onClick={handleDelete} type="delete_black-o" className={`${prefixCls}-btnGroups-delete`} />
        </div>
      </header>
      <main>
        {renderJobs()}
      </main>
      <footer>
        <JobAddBtn type={jobList.length ? 'circle' : 'normal'} />
      </footer>
    </div>
  );
};

export default Stage;
