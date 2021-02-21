import React, { memo } from 'react';
import { Icon } from 'choerodon-ui';

import './index.less';

interface IIssueType {
  colour: string,
  name: string,
  icon: string,
}

interface Props {
  data: IIssueType
  showName?: boolean
  style?: React.CSSProperties
  featureType?: string
  iconSize?: number
}
const IssueType: React.FC<Props> = memo(({
  data, showName, style, featureType, iconSize = 24,
}) => {
  let {
    colour, name = '', icon,
  } = data || {};
  if (featureType === 'business') {
    colour = '#3D5AFE';
    name = '特性';
    icon = 'characteristic';
  } else if (featureType === 'enabler') {
    colour = '#FFCA28';
    name = '使能';
    icon = 'characteristic';
  }
  if (icon === 'agile-backlog') {
    icon = 'highlight';
  }
  const reverse = ['agile_epic', 'agile_story', 'agile_fault', 'agile_task', 'agile_subtask', 'test-case', 'test-automation', 'agile-feature'].includes(icon);
  return (
    <div className="c7n-typeTag" style={style}>
      {!reverse ? (
        <Icon
          className="c7n-typeTag-icon-normal"
          style={{
            transition: 'none',
            fontSize: iconSize * 15 / 24 || '15px',
            background: colour || '#fab614',
            color: 'white',
          }}
          type={icon}
        />
      ) : (
        <Icon
          style={{
            transition: 'none',
            fontSize: iconSize || '26px',
            color: colour || '#fab614',
          }}
          type={icon || 'help'}
        />
      )}
      {
        showName && (
          <span className="name">{name}</span>
        )
      }
    </div>
  );
});

export default IssueType;
