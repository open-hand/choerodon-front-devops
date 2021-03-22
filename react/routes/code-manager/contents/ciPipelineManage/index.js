import React from 'react';
import { ThemeWrap } from '@choerodon/boot';
import { branchMap } from '@/routes/code-manager/main-view/themeMapItemPage';
import { StoreProvider } from './stores';
import CiPipelineTable from './CiPipelineTable';

export default (props) => (
  <StoreProvider {...props}>
    <ThemeWrap map={branchMap}>
      <CiPipelineTable />
    </ThemeWrap>
  </StoreProvider>
);
