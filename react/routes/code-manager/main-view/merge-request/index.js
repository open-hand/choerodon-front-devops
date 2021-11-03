import React from 'react';
import { observer } from 'mobx-react-lite';
import { TabPage, Content, ThemeWrap } from '@choerodon/master';
import { inject } from 'mobx-react';
import CodeManagerHeader from '../../header';
import CodeManagerToolBar, { SelectApp } from '../../tool-bar';
import MergeRequest from '../../contents/merge-request';
import { map } from '../themeMapItemPage';
import '../index.less';

const CodeManagerMergeRequest = inject('AppState')(observer((props) => (
  <TabPage>
    <CodeManagerToolBar name="CodeManagerMergeRequest" />
    <ThemeWrap map={map}>
      <CodeManagerHeader />
    </ThemeWrap>
    {
    props.AppState.getCurrentTheme === '' && (
      <SelectApp />
    )
  }
    <MergeRequest />
  </TabPage>
)));

export default CodeManagerMergeRequest;
