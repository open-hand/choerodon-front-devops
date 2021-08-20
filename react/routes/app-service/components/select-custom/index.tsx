/* eslint-disable max-len */
import React, { useState, ReactElement } from 'react';
import './index.less';
import { Icon } from 'choerodon-ui/pro';

type SelectMode = 'single' | 'multiple';

type SelectCustomProps<T> = {
  mode?:SelectMode,
  data:Array<T>,
  customChildren:(value:T)=>ReactElement,
  onClickCallback?:(value: T, allData:any) => any,
  identity: string
  customShadow?: (arg0:T, arg2:boolean)=> ReactElement
}

const SelectCustomItem = (props:{clickCallback: () => void, selected:boolean, children:ReactElement, customShadow:ReactElement | null}) => {
  const {
    clickCallback,
    selected,
    children,
    customShadow,
  } = props;

  const shadow = (
    <div role="none" className={`c7ncd-customSelect-shadow ${selected ? 'c7ncd-customSelect-shadow-active' : ''}`}>
      <Icon type="check" />
    </div>
  );

  return React.createElement('div', {
    className: 'c7ncd-customSelect-container',
    onClick: clickCallback,
  }, [children, customShadow ? React.cloneElement(customShadow, {
    style: {
      position: 'absolute',
      right: 0,
      top: 0,
    },
  }) : shadow]);
};

function SelectCustom<T extends {
  [field:string]:any
}>(props:SelectCustomProps<T>) {
  const {
    mode = 'single',
    data,
    customChildren,
    onClickCallback,
    identity,
    customShadow,
  } = props;

  const initData = () => {
    if (mode === 'single') {
      return data[0][identity];
    } if (mode === 'multiple') {
      return [] as Array<string>;
    }
    throw new Error('mode must be single or multiple');
  };

  const [selectedData, setSelectedData] = useState(initData);

  function handleClick(currentData:T) {
    if (mode === 'single') {
      setSelectedData(currentData[identity]);
    } else {
      const index = selectedData.indexOf(currentData[identity]);
      if (index < 0) {
        setSelectedData([...selectedData, currentData[identity]]);
      } else {
        const current = selectedData as string[];
        current.splice(index, 1);
        setSelectedData([...current]);
      }
    }
    typeof onClickCallback === 'function' && onClickCallback(currentData, selectedData);
  }

  const getSelectStatus = (item:T) => {
    if (mode === 'single') {
      return item[identity] === selectedData;
    }
    return selectedData.includes(item[identity]);
  };

  return data.map((item) => (
    <SelectCustomItem customShadow={customShadow ? customShadow(item, getSelectStatus(item)) : null} key={item[identity]} selected={getSelectStatus(item)} clickCallback={() => handleClick(item)}>
      {customChildren(item)}
    </SelectCustomItem>
  ));
}

export default SelectCustom;
