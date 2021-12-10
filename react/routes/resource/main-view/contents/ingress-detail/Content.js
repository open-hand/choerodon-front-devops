import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { useFormatMessage } from '@choerodon/master';
import map from 'lodash/map';
import { Spin, Tooltip } from 'choerodon-ui';
import { useResourceStore } from '../../../stores';
import { useCustomDetailStore } from './stores';
import Modals from './modals';
import StatusTags from '../../../../../components/status-tag';
import ResourceTitle from '../../components/resource-title';

import './index.less';

const statusTagsStyle = {
  minWidth: 40,
  marginRight: 8,
  height: '0.16rem',
  lineHeight: '0.16rem',
};

const Content = observer(() => {
  const {
    prefixCls,
    intlPrefix,
  } = useResourceStore();
  const {
    detailDs,
    intl: { formatMessage },
  } = useCustomDetailStore();

  const format = useFormatMessage('c7ncd.resource');

  function renderService({
    path, serviceName, servicePort, serviceStatus, domain,
  }) {
    return (
      <li className={`${prefixCls}-detail-section-li`}>
        <table className="detail-section-li-table">
          <tbody>
            <td className="td-width-30">
              <span className="detail-section-li-text">
                {formatMessage({ id: 'c7ncd.resource.path' })}
                :&nbsp;
              </span>
              <span>{path}</span>
            </td>
            <td className="detail-section-service">
              <span className="detail-section-li-text">
                {format({ id: 'serviceCount' })}
                :&nbsp;
              </span>
              <div className="detail-section-service">
                <StatusTags
                  colorCode={serviceStatus}
                  name={formatMessage({ id: serviceStatus })}
                  style={statusTagsStyle}
                />
                <span>{serviceName}</span>
              </div>
            </td>
            <td className="td-width-20">
              <span className="detail-section-li-text">
                {formatMessage({ id: 'c7ncd.resource.port' })}
                :&nbsp;
              </span>
              <span>{servicePort}</span>
            </td>
            <td className="td-width-6px">
              <a
                rel="nofollow me noopener noreferrer"
                target="_blank"
                href={`http://${domain}${path}`}
              >
                { format({ id: 'ClicktoAccess' }) }
              </a>
            </td>
          </tbody>
        </table>
      </li>
    );
  }

  function renderAnno(value, key) {
    return (
      <li className={`${prefixCls}-detail-section-li`}>
        <Tooltip title={key}>
          <span className="ingress-detail-annotation">{key}</span>
        </Tooltip>
        <Tooltip title={<div className={`${prefixCls}-detail-section-li-tooltip`}>{value}</div>} arrowPointAtCenter>
          <span className="ingress-detail-annotation-value">{value}</span>
        </Tooltip>
      </li>
    );
  }

  function getContent() {
    const record = detailDs.current;
    let domain;
    let paths;
    let anno;
    if (record) {
      domain = record.get('domain');
      paths = record.get('pathList');
      anno = record.get('annotations');
    }
    return (
      <>
        <div>
          <div className={`${prefixCls}-detail-content-section-title`}>
            {format({ id: 'Route' })}
            <span className={`${prefixCls}-detail-content-section-title-hover`}>(Rules)</span>
          </div>
          <div className={`${prefixCls}-detail-content-section-name`}>
            <span>{domain}</span>
          </div>
          <ul className={`${prefixCls}-detail-section-ul`}>
            {paths ? map(paths, (item) => renderService({ ...item, domain })) : '暂无数据'}
          </ul>
        </div>
        <div>
          <div className={`${prefixCls}-detail-content-section-title`}>
            <FormattedMessage id="c7ncd.resource.Annotations" />
            <span className={`${prefixCls}-detail-content-section-title-hover`}>(Annotations)</span>
          </div>
          <ul className={`${prefixCls}-detail-section-ul`}>
            {anno ? map(anno, renderAnno) : '暂无数据'}
          </ul>
        </div>
      </>
    );
  }

  return (
    <div className={`${prefixCls}-ingress-detail`}>
      <ResourceTitle iconType="language" record={detailDs.current} />
      <Spin spinning={detailDs.status === 'loading'}>
        {getContent()}
      </Spin>
      <Modals />
    </div>
  );
});

export default Content;
