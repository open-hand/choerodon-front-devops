import { EmptyPage } from '@choerodon/components';
import React from 'react';
import NoData from '@/routes/app-center-pro/assets/nodata.png';
import './index.less';

const TabEmptyPage = ({
  text,
}:{
  text:React.ReactNode
}) => (
  <EmptyPage
    image={NoData}
    description={(
      <>
        {text}
      </>
  )}
  />
);

export default TabEmptyPage;
