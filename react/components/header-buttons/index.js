import React, { useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import initial from 'lodash/initial';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import { Permission, Action } from '@choerodon/boot';
// import { Button, Tooltip } from 'choerodon-ui/pro';
import { Tooltip, Divider } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import './index.less';

const HeaderButtons = ({ items, children, showClassName = true }) => {
  const displayBtn = useMemo(() => items.filter(({ display }) => display), [items]);

  const btnNodes = useMemo(() => {
    const btnGroups = map(groupBy(displayBtn, 'group'), (value) => {
      const Split = <Divider key={Math.random()} type="vertical" className="c7ncd-header-split" />;
      const btns = map(value, ({
        name, handler, permissions, display, disabled, disabledMessage, actions, ...props
      }) => {
        let btn;
        if (actions) {
          const { data, ...restActionsProps } = actions;
          btn = (
            <Action
              {...restActionsProps}
              data={data}
              className="c7ncd-header-action"
              style={{
                color: '#3f51b5',
                padding: 0,
              }}
            />
          );
        } else {
          btn = (
            (
              <Button
                {...props}
                disabled={disabled}
                onClick={handler}
                type="primary"
              >
                {name}
              </Button>
            )
          );
        }

        return (
          <Fragment key={name}>
            {permissions && permissions.length ? (
              <Permission service={permissions}>
                {disabled && disabledMessage ? (
                  <Tooltip title={disabledMessage || ''} placement="bottom">
                    {btn}
                  </Tooltip>
                ) : btn}
              </Permission>
            ) : btn}
          </Fragment>
        );
      });

      return [...btns, Split];
    });

    return initial(flatten(btnGroups));
  }, [displayBtn]);

  return displayBtn.length ? (
    <div
      className={showClassName ? 'c7ncd-header-btns' : ''}
      style={{
        direction: 'rtl',
      }}
    >
      {btnNodes}
      {children}
    </div>
  ) : null;
};

HeaderButtons.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  items: PropTypes.array,
};

HeaderButtons.defaultProps = {
  items: [],
};

export default HeaderButtons;
