import { Action } from '@choerodon/master';
import React from 'react';

const ConfigItemChild = (props:any) => {
  const {
    subfixCls,
  } = props;
  return (
    <div className={`${subfixCls}-resourceConfig-main`}>
      <div>
        <span>
          ing-2
        </span>
        <span>
          域名名称
        </span>
      </div>
      <div style={{
        maxWidth: 90,
        alignItems: 'center',
      }}
      >
        <Action />
      </div>
      <div>
        <span>
          ing-demo.com
        </span>
        <span>
          地址
        </span>
      </div>
      <div>
        <span>
          /
        </span>
        <span>
          路径
        </span>
      </div>
    </div>
  );
};

export default ConfigItemChild;
