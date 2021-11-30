import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import { Icon } from 'choerodon-ui/pro';
import {} from '@choerodon/components';
import SerialLines from './components/serial-lines';
import ParalleLines from './components/paralle-lines';

import './index.less';

export type JobProps = {

} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-jobItem';

const JobItem:FC<JobProps> = (props) => {
  const {
    id: jobId,
    name,
    type: jobType,
  } = props;

  console.log(props);

  const formatCommon = useFormatCommon();
  // const formatJob = useFormatMessage(intlPrefix);

  return (
    <div className={prefixCls}>
      <SerialLines />
      <ParalleLines />
      <div className={`${prefixCls}-content`}>
        <Icon className={`${`${prefixCls}`}-icon`} type="settings" />
        <span className={`${prefixCls}-name`}>{name}</span>
      </div>
    </div>
  );
};

export default JobItem;
