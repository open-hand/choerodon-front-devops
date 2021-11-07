import React from 'react';
import { observer } from 'mobx-react-lite';
import { TabPage, ThemeWrap } from '@choerodon/master';
import { inject } from 'mobx-react';
import CodeManagerHeader from '../../header';
import CodeManagerToolBar, { SelectApp } from '../../tool-bar';
import { map } from '../themeMapItemPage';
import CodeManagerCiPipelineManage from '../../contents/ciPipelineManage';
import '../index.less';

const CiPipelineManage = inject('AppState')(observer((props) => (
  <TabPage>
    <CodeManagerToolBar name="CodeManagerCiPipelineManage" key="CodeManagerCiPipelineManage" />
    <ThemeWrap
      map={map}
    >
      <CodeManagerHeader />
    </ThemeWrap>
    {
    props.AppState.getCurrentTheme === '' && (
      <SelectApp />
    )
  }
    <CodeManagerCiPipelineManage />
  </TabPage>
)));

export default CiPipelineManage;
