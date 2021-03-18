import { SelectApp } from '@/routes/code-manager/tool-bar';
import React from 'react';
import branchTheme4Style from '../contents/branch/theme4.module.less';

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
};

export { map, branchMap };
