/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import React, {
  FC, memo, useEffect, useMemo, useState,
} from 'react';
import './index.less';

interface Props {
  onChange?(value: string): void,
  defaultActiveKey?: string,
  activeKey?: string,
  hostTabKeys: {
    key:string,
    text:string,
  }[],
}

const HostPick: FC<Props> = memo(({
  onChange,
  defaultActiveKey = 'distribute_test',
  hostTabKeys,
  activeKey: propsActiveKey,
}) => {
  const [activeKey, setActiveKey] = useState(propsActiveKey || defaultActiveKey);

  useEffect(() => {
    if (propsActiveKey) {
      handleClick(propsActiveKey);
    }
  }, [propsActiveKey]);

  const handleClick = (value: string) => {
    if (value !== activeKey) {
      setActiveKey(value);
      if (onChange) {
        onChange(value);
      }
    }
  };

  const getContent = () => hostTabKeys.map(({ key, text }) => (
    <>
      <div
        key={key}
        className={`c7ncd-host-pick-item ${key === activeKey ? 'c7ncd-host-pick-item-active' : ''}`}
        onClick={() => handleClick(key)}
      >
        <span>{text}</span>
      </div>
      <span className="c7ncd-host-pick-item-line" />
    </>
  ));

  return (
    <div className="c7ncd-host-pick">
      {getContent()}
    </div>
  );
});

export default HostPick;
