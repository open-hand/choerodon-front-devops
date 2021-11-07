import React from 'react';
import { observer } from 'mobx-react-lite';
import { TabPage, ThemeWrap } from '@choerodon/master';
import { inject } from 'mobx-react';
import { map } from '../themeMapItemPage';
import CodeManagerHeader from '../../header';
import CodeManagerToolBar, { SelectApp } from '../../tool-bar';
import CodeQualityContent from './content';
import '../index.less';

const CodeQuality = inject('AppState')(observer((props) => (
  <TabPage>
    <CodeManagerToolBar name="CodeQuality" key="CodeQuality" />
    <ThemeWrap map={map}>
      <CodeManagerHeader />
    </ThemeWrap>
    {
    props.AppState.getCurrentTheme === '' && (
      <SelectApp />
    )
  }
    <CodeQualityContent />
  </TabPage>
)));

export default CodeQuality;
