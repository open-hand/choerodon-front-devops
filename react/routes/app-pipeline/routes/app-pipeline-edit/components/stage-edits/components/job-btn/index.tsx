/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import { Popover } from 'choerodon-ui';
import { useBoolean } from 'ahooks';
import { observer } from 'mobx-react-lite';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';
import JobTypesPanel from './components/job-types-panel';
import JobCdPanel from './components/job-CD-panel';
import { useStageEditsStore } from '../../stores';

const prefixCls = 'c7ncd-pipeline-edit-jobbtn';

interface JobAddBtnProps {
  type:'circle' | 'normal'
  linesType: 'paralle' | 'serial'
  handleJobAddCallback:(addonData: any)=>(editData:any)=>void
  stageIndex:number
  jobIndex:number
}

const JobAddBtn = (props:JobAddBtnProps) => {
  const {
    type,
    linesType,
    handleJobAddCallback,
    stageIndex,
    jobIndex,
  } = props;

  const [popoverVisible, { setFalse, toggle }] = useBoolean(false);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!document?.querySelector('.c7ncd-pipeline-edit-jobbtn-normal')?.contains(event.target)
        && !document?.querySelector('.c7ncd-pipeline-edit-jobbtn-popover')?.contains(event.target)
      ) {
        let flag = false;
        const doms = [
          document.querySelectorAll('.c7ncd-pipeline-edit-jobbtn-normal'),
          document.querySelectorAll('.c7n-popover-content'),
        ];
        doms.forEach((d: any) => {
          d?.length > 0 && d.forEach((i: any) => {
            if (i.contains(event.target)) {
              flag = true;
            }
          });
        });
        if (!flag) {
          setFalse();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    currentOpenPanelIdentity,
    setOpenPanelIdentity,
  } = useStageEditsStore();

  const linesMap = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  } as const;

  const jobTypePanelMap = {
    paralle: <JobTypesPanel handleBlur={setFalse} handleJobAddCallback={handleJobAddCallback} handlePanelClickCallback={setFalse} />,
    serial: <JobCdPanel handleBlur={setFalse} jobIndex={jobIndex} stageIndex={stageIndex} handleJobAddCallback={handleJobAddCallback} handlePanelClickCallback={setFalse} />,
  };

  const handlePanelToggle = () => {
    setOpenPanelIdentity(popoverVisible ? '' : stageIndex);
    toggle();
  };

  const renderContent = () => {
    if (type === 'circle') {
      return <Icon type="add" onClick={handlePanelToggle} className={`${prefixCls}`} />;
    }
    return (
      <div
        className={`${prefixCls}-normal`}
        onClick={handlePanelToggle}
        role="none"
      >
        {linesMap[linesType]}
        <div className={`${prefixCls}-normal-content`}>
          <Icon type="add" />
          <span>添加任务</span>
        </div>
      </div>
    );
  };

  return (
    <Popover
      visible={currentOpenPanelIdentity === stageIndex && popoverVisible}
      content={jobTypePanelMap[linesType]}
      placement={'bottom' as any}
      overlayClassName={`${prefixCls}-popover`}
    >
      {renderContent()}
    </Popover>
  );
};

export default observer(JobAddBtn);
