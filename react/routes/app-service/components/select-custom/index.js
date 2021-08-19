/* eslint-disable max-len */
import { injectIntl } from 'react-intl';
import React, { useState } from 'react';
import './index.less';
import { Icon } from 'choerodon-ui';

const SelectCustomItem = (props) => {
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

const SelectCustom = injectIntl(({
  mode = 'single',
  data,
  customChildren,
  onClickCallback,
}) => {
  const initData = () => {
    if (mode === 'single') {
      return data[0].type;
    }
    return [];
  };

  const [selectedData, setSelectedData] = useState(initData);

  function handleClick(currentData) {
    if (mode === 'single') {
      setSelectedData(currentData.type);
      onClickCallback(currentData);
    } else {
      const index = selectedData.indexOf(currentData.type);
      console.log('index', index);
      if (index === -1) {
        setSelectedData([...selectedData, currentData.type]);
      } else {
        const current = selectedData;
        current.splice(index);
        setSelectedData([...current]);
      }
    }
  }

  const getSelectStatus = (item) => {
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
