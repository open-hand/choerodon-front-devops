import React from 'react';
import { ThemeWrap } from '@choerodon/master';
import { branchMap } from '@/routes/code-manager/main-view/themeMapItemPage';
import AppTagComponent from './AppTag';
import { AppTagStoreProvider } from './stores';

export default function AppTag(props) {
  return (
    <AppTagStoreProvider {...props}>
      <ThemeWrap map={branchMap}>
        <AppTagComponent />
      </ThemeWrap>
    </AppTagStoreProvider>
  );
}
