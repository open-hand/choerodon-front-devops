import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from 'choerodon-ui';

import './index.less';

const Details = (props) => {
  const {
    intlPrefix, record, prefixCls, formatMessage, type,
  } = props;

  const renderStatus = () => {
    let status;
    if (record.get('fail')) {
      status = 'failed';
    } else if (record.get('synchro') && record.get('active')) {
      status = 'active';
    } else if (record.get('active')) {
      status = 'creating';
    } else {
      status = 'stop';
    }

    return status;
  };

  const renderMarketDetails = () => (
    <ul className={`${prefixCls}-application-detail-modal`}>
      <li className="detail-item">
        <span className="detail-item-text">
          应用服务名称
        </span>
        <span>{record.get('marketServiceName') || '-'}</span>
      </li>

      <li className="detail-item">
        <span className="detail-item-text">
          应用服务编码
        </span>
        <span>{record.get('devopsAppServiceCode') || '-'}</span>
      </li>

      <li className="detail-item">
        <span className="detail-item-text">
          所属市场服务
        </span>
        <span>{record.get('devopsAppServiceName') || '-'}</span>
      </li>

      <li className="detail-item">
        <span className="detail-item-text">
          所属市场应用及版本
        </span>
        <span>{`${record.get('appName')}(${record.get('appVersion')})`}</span>
      </li>
    </ul>
  );

  const renderOtherDetails = () => (
    <ul className={`${prefixCls}-application-detail-modal`}>
      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: `${intlPrefix}.service.status` })}
        </span>
        <FormattedMessage id={renderStatus()} />
      </li>

      <li className="detail-item">
        <span className="detail-item-text">
          {formatMessage({ id: `${intlPrefix}.service.code` })}
        </span>
        <span>{record.get('code')}</span>
      </li>

      <li className="detail-item detail-item-has-url">
        <span className="detail-item-text">
          {record.get('shareProjectName') ? '来源项目' : formatMessage({ id: `${intlPrefix}.service.url` })}
        </span>
        <Tooltip title={record.get('repoUrl')}>
          {
            record.get('shareProjectName') ? (
              <span>{record.get('shareProjectName')}</span>
            ) : (
              <a
                href={record.get('repoUrl')}
                className="detail-item-url"
                target="_blank"
                rel="nofollow me noopener noreferrer"
              >
                <span>{record.get('repoUrl')}</span>
              </a>
            )
          }
        </Tooltip>
      </li>
    </ul>
  );

  const getContent = () => {
    if (type === 'market_service') {
      return renderMarketDetails();
    }
    return renderOtherDetails();
  };

  return (
    getContent()
  );
};

export default Details;
