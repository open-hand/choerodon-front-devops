import React from 'react';
import { ThemeWrap } from '@choerodon/boot';
import { StoreProvider } from './stores';
import Branch from './Branch';
import { branchMap } from '../../main-view/themeMapItemPage';

export default (props) => (
  <StoreProvider {...props}>
    <ThemeWrap map={branchMap}>
      <Branch />
    </ThemeWrap>
  </StoreProvider>
);
