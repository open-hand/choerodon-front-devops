import React from 'react';
import { ThemeWrap } from '@choerodon/boot';
import { branchMap } from '@/routes/code-manager/main-view/themeMapItemPage';
import RequestPanel from './RequestPanel';

import StoreProvider from './stores';

export default function Request(props) {
  return (
    <StoreProvider {...props}>
      <ThemeWrap map={branchMap}>
        <RequestPanel />
      </ThemeWrap>
    </StoreProvider>
  );
}
