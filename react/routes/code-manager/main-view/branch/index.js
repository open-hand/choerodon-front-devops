import React from 'react';
import { observer } from 'mobx-react-lite';
import { TabPage, ThemeWrap } from '@choerodon/boot';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import CodeManagerHeader from '../../header';
import CodeManagerToolBar, { SelectApp } from '../../tool-bar';
import Branch from '../../contents/branch';
import { map } from '../themeMapItemPage';
import '../index.less';

const CodeManagerBranch = injectIntl(inject('AppState')(observer((props) => (
  (
    <TabPage>
      <CodeManagerToolBar name="CodeManagerBranch" key="CodeManagerBranch" />
      <ThemeWrap map={map}>
        <CodeManagerHeader />
      </ThemeWrap>
      {
          props.AppState.getCurrentTheme === '' && (
            <SelectApp />
          )
        }
      <Branch />
    </TabPage>
  )
))));

export default CodeManagerBranch;
