/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import './index.less';

export default function ({
  intlPrefix, record, prefixCls, formatMessage,
}) {
  return (
    <ul className={`${prefixCls}-detail-modal`}>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'boot.createDate' })}
        </span>
        <span>
          {
            (record
            && record.get('creationDate')) || '-'
          }

        </span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'c7ncd.resource.creator' })}
        </span>
        <span>
          {
            (record
            && record.get('creatorName')) || '-'
          }

        </span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'boot.updateDate' })}
        </span>
        <span>
          {(record
            && record.get('lastUpdateDate')) || '-' }

        </span>
      </li>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: 'c7ncd.resource.updater' })}
        </span>
        <span>
          {(record
            && record.get('lastUpdaterName')) || '-' }

        </span>
      </li>
    </ul>

  );
}
