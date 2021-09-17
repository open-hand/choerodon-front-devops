import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Icon, Spin, Tooltip } from 'choerodon-ui';
import PageTitle from '../../../../../components/page-title';
import { useResourceStore } from '../../../stores';

import './index.less';

function ResourceTitle(props) {
  const {
    record, iconType, statusKey, errorKey,
  } = props;
  const {
    resourceStore,
    treeDs,
    resourceStore: { getSelectedMenu: { key } },
    intl: { formatMessage },
  } = useResourceStore();

  function getCurrent() {
    if (record) {
      const id = record.get('id');
      const name = record.get('name');
      const status = record.get(statusKey);
      const errorText = record.get(errorKey);

      return {
        id,
        name,
        status,
        errorText,
      };
    }
    return null;
  }

  function getTitle() {
    const current = getCurrent();
    if (current) {
      const {
        name, status, errorText, error,
      } = current;
      return (
        <div className="c7ncd-resource-title">
          <Icon type={iconType} className="c7ncd-resource-title-icon" />
          <span className="c7ncd-resource-title-name">{name}</span>
          {status === 'failed' && (
          <Tooltip title={errorText || error}>
            <Icon type="error" className="c7ncd-resource-title-error-icon" />
          </Tooltip>
          )}
          {status === 'operating' && (
          <Tooltip title={formatMessage({ id: 'operating' })}>
            <Spin
              className="c7ncd-resource-title-operating-icon"
              type="loading"
              size="small"
              width={15}
            />
          </Tooltip>
          )}
        </div>
      );
    }
    return null;
  }

  function getFallBack() {
    const { name, status, error } = resourceStore.getSelectedMenu;
    return (
      <div className="c7ncd-resource-title">
        <Icon type={iconType} className="c7ncd-resource-title-icon" />
        <span>{name}</span>
        {status === 'failed' && (
        <Tooltip title={error}>
          <Icon type="error" className="c7ncd-resource-title-error-icon" />
        </Tooltip>
        )}
      </div>
    );
  }

  useEffect(() => {
    const current = getCurrent();
    if (current) {
      const { id, name, status } = current;
      const menuItem = treeDs.find((item) => item.get('key') === key && item.get('id') === id);
      if (menuItem && (menuItem.get('name') !== name || menuItem.get('status') !== status)) {
        runInAction(() => {
          menuItem.set({ name, status });
          resourceStore.setSelectedMenu({
            ...resourceStore.getSelectedMenu,
            ...current,
          });
        });
      }
    }
  }, [record]);

  return (
    <PageTitle content={getTitle()} fallback={getFallBack()} />
  );
}

ResourceTitle.propTypes = {
  iconType: PropTypes.string.isRequired,
  statusKey: PropTypes.string,
  errorKey: PropTypes.string,
};

ResourceTitle.defaultProps = {
  statusKey: 'status',
  errorKey: 'error',
};

export default observer(ResourceTitle);
