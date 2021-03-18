import React from 'react';
import { observer } from 'mobx-react-lite';
import { TabPage, ThemeWrap } from '@choerodon/boot';
import { inject } from 'mobx-react';
import { map } from '../themeMapItemPage';
import CodeManagerHeader from '../../header';
import CodeManagerToolBar, { SelectApp } from '../../tool-bar';
import AppTag from '../../contents/app-tag';
import '../index.less';

const CodeManagerAppTag = inject('AppState')(observer((props) => (
  <TabPage>
    <CodeManagerToolBar name="CodeManagerAppTag" key="CodeManagerAppTag" />
    <ThemeWrap map={map}>
      <CodeManagerHeader />
    </ThemeWrap>
    {
    props.AppState.getCurrentTheme === '' && (
      <SelectApp />
    )
  }
    <AppTag />
  </TabPage>
)));

export default CodeManagerAppTag;
