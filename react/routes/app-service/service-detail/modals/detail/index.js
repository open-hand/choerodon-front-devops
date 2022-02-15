import React from 'react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { Avatar } from 'choerodon-ui';
import './index.less';

export default function ({
  record, formatMessage, prefixCls, intlPrefix,
}) {
  let statusLabel;
  if (record.get('fail')) {
    // 失败
    statusLabel = {
      status: formatMessage({ id: 'failed' }),
      color: '#f44336',
    };
  } else if (record.get('synchro') && record.get('active')) {
    // 运行中
    statusLabel = {
      status: formatMessage({ id: 'app.active' }),
      color: '#00bf96',
    };
  } else if (record.get('active')) {
    // 创建中
    statusLabel = {
      status: formatMessage({ id: 'app.create' }),
      color: '#4d90fe',
    };
  } else {
    // 停止
    statusLabel = {
      status: formatMessage({ id: 'app.stop' }),
      color: '#d3d3d3',
    };
  }
  return (
    <ul className={`${prefixCls}-detail`}>
      <li className="detail-item-avatar">
        {
          record && record.get('imgUrl')
            ? <Avatar size={80} src={record.get('imgUrl')} />
            : (
              <div className={`${prefixCls}-detail-avatar`}>
                <span>{record.get('name') ? record.get('name').slice(0, 1) : '?'}</span>
              </div>
            )
        }
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: `${intlPrefix}.name` })}
        </span>
        <span>{record && record.get('name')}</span>
      </li>
      <li className="detail-item detail-item-has-url">
        <span className="detail-item-text">
          {formatMessage({ id: 'app.status' })}
        </span>
        <StatusLabel {...statusLabel} />
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: `${intlPrefix}.type` })}
        </span>
        <span>
          {record
          && record.get('type') && formatMessage({ id: `app.type.${record.get('type')}` })}
        </span>
      </li>
      <li className="detail-item detail-item-has-url">
        <span className="detail-item-text">
          {formatMessage({ id: 'repository.head' })}
        </span>
        {record && record.get('repoUrl')
          ? (
            <a
              href={record.get('repoUrl')}
              className="detail-item-url"
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <span>{record.get('repoUrl')}</span>
            </a>
          ) : '-'}
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'boot.createDate' })}
        </span>
        <span>{(record && record.get('creationDate')) || '-'}</span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'app.creator' })}
        </span>
        <span>{(record && record.get('createUserName')) || '-'}</span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'boot.updateDate' })}
        </span>
        <span>{(record && record.get('lastUpdateDate')) || '-'}</span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'app.updater' })}
        </span>
        <span>{(record && record.get('updateUserName')) || '-'}</span>
      </li>
    </ul>
  );
}

function StatusLabel(props) {
  const { color, status } = props;
  return (
    <div className="status-label" style={{ background: color }}>
      <span className="status-label-text"><FormattedMessage id={status} /></span>
    </div>
  );
}
