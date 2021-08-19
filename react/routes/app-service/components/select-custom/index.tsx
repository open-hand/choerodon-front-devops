/* eslint-disable max-len */
import { injectIntl } from 'react-intl';
import React, { useState } from 'react';
import './index.less';
import { Icon } from 'choerodon-ui';

const SelectCustomItem = (props:{clickCallback: () => void, selected:boolean, children:Element}) => {
  const {
    clickCallback,
    selected,
    children,
  } = props;

  return (
    <div role="none" className={selected ? 'c7ncd-select-custom-active' : 'c7ncd-select-custom'} onClick={clickCallback}>
      <div
        className={selected ? 'c7ncd-Icon-containner' : '.c7ncd-Icon-containner-none'}
      >
        <Icon type="check" />
      </div>
      {children}
    </div>
  );
};
interface dataProps{
  type:string,
  img:string;
}
const SelectCustom = injectIntl(({
  mode = 'single',
  data,
  customChildren,
  onClickCallback,
}:{mode:string, data:dataProps[], customChildren:(value:dataProps)=>Element, onClickCallback:(value: string) => void}) => {
  const initData = () => {
    if (mode === 'single') {
      return data[0].type;
    }
    return [] as string[];
  };

  const [selectedData, setSelectedData] = useState(initData);

  function handleClick(currentData:dataProps) {
    console.log('currentData', currentData.type);
    if (mode === 'single') {
      setSelectedData(currentData.type);
      onClickCallback(currentData.type);
    } else {
      const index = (selectedData).indexOf(currentData.type);
      if (index === -1) {
        setSelectedData([...selectedData, currentData.type]);
      } else {
        const current = selectedData as string[];
        current.splice(index, 1);
        setSelectedData([...current]);
      }
    }
  }

  const getSelectStatus = (item:dataProps) => {
    if (mode === 'single') {
      return item.type === selectedData;
    }
    return selectedData.includes(item.type);
  };

  return data.map((item) => (
    <SelectCustomItem selected={getSelectStatus(item)} clickCallback={() => handleClick(item)}>
      {customChildren(item)}
    </SelectCustomItem>
  ));
});
export default SelectCustom;
