/* eslint-disable */
import React, {
  useState, useMemo, useRef, useCallback, useEffect,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormatMessage } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { Icon, Tooltip } from 'choerodon-ui';
import map from 'lodash/map';
import classnames from 'classnames';
import UserInfo from '../../../../../../../components/userInfo/UserInfo';
import { useResourceStore } from '../../../../../stores';
import { useInstanceStore } from '../../stores';

import './index.less';

const ICON_TYPE_MAPPING = {
  failed: 'cancel',
  operating: 'timelapse',
  success: 'check_circle',
};

const OpCard = ({
  index, record, isActive, intlPrefix, prefixCls, formatMessage, onClick, effectCommandId,
}) => {
  const podKeys = useMemo(() => (['type', 'createTime', 'status', 'loginName', 'realName', 'userImage', 'podEventVO']), []);
  const [
    type,
    createTime,
    status,
    loginName,
    realName,
    userImage,
  ] = map(podKeys, (item) => record.get(item));
  const commandId = record.get('commandId');
  const commandError = record.get('commandError');
  const cardClass = classnames({
    'operation-record-card': true,
    'operation-record-card-active': isActive,
  });
  const handleClick = useCallback(() => onClick(commandId, index > 3), [commandId, index]);

  return (
    <div
      className={cardClass}
      onClick={handleClick}
    >
      <div className="operation-record-title">
        <Tooltip title={formatMessage({ id: status })}>
          <Icon type={ICON_TYPE_MAPPING[status]} className={`${prefixCls}-cases-status-${status}`} />
        </Tooltip>
        <FormattedMessage id={`c7ncd.resource.${type}.application`} />
        {effectCommandId && effectCommandId === commandId && (
          <div className={`${prefixCls}-cases-record-effectCommand`}>
            <span className={`${prefixCls}-cases-record-effectCommand-text`}>
              {formatMessage({ id: 'c7ncd.resource.active' })}
            </span>
          </div>
        )}
        {commandError && status === 'failed' && (
          <Tooltip title={commandError}>
            <Icon type="error" className={`${prefixCls}-cases-record-error`} />
          </Tooltip>
        )}
      </div>
      <div className="operation-record-step">
        <i className="operation-record-icon" />
      </div>
      <div className="operation-record-user"><UserInfo name={realName} id={loginName} avatar={userImage} /></div>
      <div className="operation-record-time">{createTime}</div>
    </div>
  );
};

const OpRecord = observer(({ handleClick, active }) => {
  const rowRef = useRef(null);
  const {
    prefixCls,
    intlPrefix,
    resourceStore: { getSelectedMenu: { id, parentId } },
  } = useResourceStore();
  const {
    intl: { formatMessage },
    casesDs,
    baseDs,
  } = useInstanceStore();
  const [cardActive, setCardActive] = useState(null);

  const format = useFormatMessage('c7ncd.resource');

  useEffect(() => {
    setCardActive(null);
  }, [id, parentId]);

  function handleRecordClick(commandId, isIgnore) {
    setCardActive(commandId);
    handleClick(commandId, isIgnore);
  }

  function renderOperation() {
    let realActive = cardActive || active;
    const isExist = casesDs.find((r) => r.get('commandId') === realActive);

    if (!realActive || !isExist) {
      const firstRecord = casesDs.get(0);
      realActive = firstRecord.get('commandId');
    }

    return (
      <div ref={rowRef} className="cases-record-detail">
        {casesDs.map((record, index) => {
          const commandId = record.get('commandId');
          return (
            <OpCard
              index={index}
              key={commandId}
              isActive={realActive === commandId}
              formatMessage={formatMessage}
              record={record}
              prefixCls={prefixCls}
              intlPrefix={intlPrefix}
              onClick={handleRecordClick}
              effectCommandId={baseDs.current && baseDs.current.get('effectCommandId')}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${prefixCls}-cases-record`}>
      <span className="cases-record-title">
        {format({ id: 'OperationRecord' })}
      </span>
      {renderOperation()}
    </div>
  );
});

export default OpRecord;
