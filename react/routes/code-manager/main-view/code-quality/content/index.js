import React from 'react';
import { ThemeWrap } from '@choerodon/master';
import { branchMap } from '@/routes/code-manager/main-view/themeMapItemPage';
import CodeQualityComponent from './CodeQuality';
import { CodeQualityStoreProvider } from './stores';

export default function AppTag(props) {
  return (
    <CodeQualityStoreProvider {...props}>
      <ThemeWrap map={branchMap}>
        <CodeQualityComponent />
      </ThemeWrap>
    </CodeQualityStoreProvider>
  );
}
