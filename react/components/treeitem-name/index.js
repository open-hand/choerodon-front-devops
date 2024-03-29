import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { useFormatMessage } from '@choerodon/master';
import toUpper from 'lodash/toUpper';
import classnames from 'classnames';

import './index.less';

const TreeItemName = memo(({
  name, search, disabled, headSpace,
}) => {
  const format = useFormatMessage('c7ncd.environment');

  const newName = name === 'c7ncd.env.group.default' ? format({ id: 'default' }) : name;

  const index = toUpper(newName).indexOf(toUpper(search));
  const beforeStr = newName?.substr(0, index);
  const currentStr = newName?.substr(index, search.length);
  const afterStr = newName?.substr(index + search.length);

  const textClass = classnames({
    'c7ncd-treemenu-text': true,
    'c7ncd-treemenu-text-disabled': disabled,
    'c7ncd-treemenu-text-ml': headSpace,
  });
  const decribe = {
    工作负载: 'WorkLoad', 网络: 'Service', 域名: 'Ingress', 配置映射: 'ConfigMap', 密文: 'Secret',
  };
  return (
    <span className={textClass}>
      {index > -1 ? (
        <>
          {beforeStr}
          <span className="c7ncd-treemenu-text-highlight">{currentStr}</span>
          {afterStr}
          {decribe[afterStr] ? ` (${decribe[afterStr]})` : ''}

        </>
      ) : newName}
      {disabled && <i className="c7ncd-treemenu-disabled" />}
    </span>
  );
});

TreeItemName.propTypes = {
  name: PropTypes.string.isRequired,
  search: PropTypes.string,
  disabled: PropTypes.bool,
  headSpace: PropTypes.bool,
};

TreeItemName.defaultProps = {
  disabled: false,
  headSpace: true,
  search: '',
};

export default TreeItemName;
