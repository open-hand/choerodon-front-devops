import React, {
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import { useQuery } from 'react-query';
import { useReactive } from 'ahooks';
import map from 'lodash/map';
import { useStageEditsStore } from './stores';
import tempdata from './stores/data.json';
import {} from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import { StageEditsDataTypes } from './interface';
import Stage from './components/stage';
import StageAddBtn from './components/stage-btn';

const StageEdits = () => {
  const {
    mainStore,
    prefixCls,
    formatStageEdits,
    formatCommon,
  } = useStageEditsStore();

  const { data: sourceData = [], isLoading, isFetching } = useQuery<unknown, unknown, Array<any>>('app-pipeline-edit',
    () => new Promise((resolve) => setTimeout(() => {
      const { devopsCdStageVOS, devopsCiStageVOS } = tempdata;
      resolve([...devopsCiStageVOS, ...devopsCdStageVOS]);
    }, 1000)), {
      onSuccess: handleLoadSuccess,
    });

  function handleLoadSuccess(stagesData:any[]) {
    console.log(stagesData);
  }

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

  if (isLoading) {
    return <Loading type="c7n" />;
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-container`}>
        {renderStages()}
      </div>
    </div>
  );
};

export default observer(StageEdits);
