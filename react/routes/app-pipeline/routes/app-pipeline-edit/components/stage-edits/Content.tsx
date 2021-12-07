import React, {
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { Alert } from 'choerodon-ui';
import { useStageEditsStore } from './stores';
import {} from '@choerodon/master';
import Stage from './components/stage';
import StageAddBtn from './components/stage-btn';

const StageEdits = () => {
  const {
    mainStore,
    prefixCls,
    formatStageEdits,
    formatCommon,
    sourceData,
  } = useStageEditsStore();

  const renderStages = () => {
    const groups = map(sourceData, (stage:any, index:number) => (
      <>
        {/* 第一个按钮 */}
        {!index && <StageAddBtn showPreLine={false} />}
        <Stage key={stage?.id} {...stage} />
        <StageAddBtn showNextLine={index !== sourceData.length - 1} />
      </>
    ));
    return groups;
  };

  return (
    <div className={prefixCls}>
      <Alert showIcon type="warning" message="此页面定义了CI阶段或其中的任务后，GitLab仓库中的.gitlab-ci.yml文件也会同步修改。" />
      <div className={`${prefixCls}-container`}>
        {renderStages()}
      </div>
    </div>
  );
};

export default observer(StageEdits);
