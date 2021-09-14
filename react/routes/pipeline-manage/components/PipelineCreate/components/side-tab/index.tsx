import React, { useState } from 'react';

import './index.less';

const cssPrefix = 'c7ncd-pipelineCreate-sideTab';

const sideData = [{
  name: '基础配置',
  key: '1',
}];

const Index = ({
  component,
}: {
  component: React.ReactNode,
}) => {
  const [activeKey, setActiveKey] = useState(sideData[0].key);

  const renderSideData = ({
    itemCssPrefix,
  }: {
    itemCssPrefix: string,
  }) => sideData.map((side) => (
    <div className={`${itemCssPrefix}__itemTab`}>
      {
        (activeKey === side.key) && (
          <span className={`${itemCssPrefix}__itemTab__activeLine`} />
        )
      }
      <span className={activeKey === side.key ? `${itemCssPrefix}__itemTab--active` : `${itemCssPrefix}__itemTab--inactive`}>
        {side.name}
      </span>
    </div>
  ));

  return (
    <div className={cssPrefix}>
      <div className={`${cssPrefix}__side`}>
        {renderSideData({
          itemCssPrefix: `${cssPrefix}__side`,
        })}
      </div>
      <div className={`${cssPrefix}__divided`} />
      <div className={`${cssPrefix}__component`}>
        {component}
      </div>
    </div>
  );
};

export default Index;
