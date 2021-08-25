import React, { useState } from 'react';
import { Action } from '@choerodon/master';
import { Button } from 'choerodon-ui/pro';
import ConfigItemChild from '../CongfigItemChild';

type Props = {
  subfixCls: string,
  data: any,
}

const ResourceConfigItem:React.FC<Props> = ({
  subfixCls,
  data,
}) => {
  const {
    children,
  } = data;

  const [expand, setExpand] = useState<boolean>(false);

  const renderChildren = () => children?.map((value:any) => (
    <ConfigItemChild subfixCls={subfixCls} />
  ));

  return (
    <div className={`${subfixCls}-resourceConfig-item`}>
      <main className={`${subfixCls}-resourceConfig-main`}>
        <div>
          <span>
            SVC-1
          </span>
          <span>
            网络名称（Service）
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
            实例
          </span>
          <span>
            目标对象类型
          </span>
        </div>
        <div>
          <span>
            devops-app
          </span>
          <span>
            目标对象
          </span>
        </div>
        <div>
          <span>
            ClisterIP
            <Button icon="expand_more" />
          </span>
          <span>
            配置类型
          </span>
        </div>
        <div style={{
          maxWidth: 90,
          alignItems: 'flex-end',
        }}
        >
          <Button disabled={!children?.length} icon={expand ? 'expand_less' : 'expand_more'} onClick={() => setExpand(!expand)} />
        </div>
      </main>
      <footer style={{
        display: expand ? 'block' : 'none',
      }}
      >
        {renderChildren()}
      </footer>
    </div>
  );
};

export default ResourceConfigItem;
