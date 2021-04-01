import { SelectApp } from '@/routes/code-manager/tool-bar';
import { Table } from 'choerodon-ui/pro';
import React from 'react';
import branchTheme4Style from '../contents/branch/theme4.module.less';

const { Column } = Table;

const map = {
  key: {
    breadCrumb: {
      origin: {},
      theme4: {
        extraNode: (
          <SelectApp theme4 />
        ),
      },
    },
  },
};

const branchMap = {
  style: {
    origin: null,
    theme4: branchTheme4Style,
  },
  key: {
    columnsRender: {
      origin: ({
        branchNameRenderer,
        actionRender,
        updateCommitRender,
        createUserRender,
        isOPERATIONS,
        issueNameRender,
      }) => [
        <Column name="branchName" renderer={branchNameRenderer} sortable />,
        <Column align="right" width={60} renderer={actionRender} />,
        <Column name="commitContent" className="lasetCommit" width={300} renderer={updateCommitRender} />,
        <Column name="createUserRealName" renderer={createUserRender} />,
        !isOPERATIONS && <Column name="issueName" renderer={issueNameRender} />,
      ],
      theme4: ({ theme4RenderColumn }) => (
        <Column renderer={theme4RenderColumn} />
      ),
    },
  },
};

export { map, branchMap };
