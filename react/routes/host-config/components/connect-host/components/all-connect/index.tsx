import React, {
  ReactNode,
  useCallback, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Icon,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import { ButtonColor } from '@/interface';
import { useHostConnectStore } from '../../stores';

import './index.less';

const AllConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    modal,
    typeKeys,
    mainStore,
  } = useHostConnectStore();

  const goNextStep = useCallback(() => {
    mainStore.setCurrentStep(mainStore.getCurrentType);
  }, [mainStore.getCurrentType]);

  useEffect(() => {
    modal.update({
      title: '连接主机',
      footer: (okBtn: ReactNode, cancelBtn: ReactNode) => (
        <>
          {cancelBtn}
          <Button
            color={'primary' as ButtonColor}
            onClick={goNextStep}
          >
            下一步
          </Button>
        </>
      ),
    });
  }, [goNextStep]);

  const handleSelect = useCallback((key: string) => {
    mainStore.setCurrentType(key);
  }, []);

  return (
    <>
      {map(typeKeys, (value: string, key: string) => (
        <div
          onClick={() => handleSelect(value)}
          role="none"
          className={`${prefixCls}-card ${mainStore.getCurrentType === value ? `${prefixCls}-card-selected` : ''}`}
        >
          <Icon type="edit_o" />
          <span className={`${prefixCls}-card-title`}>
            {formatMessage({ id: `${intlPrefix}.connect.${key}` })}
          </span>
          <div className={`${prefixCls}-card-des`}>
            <span>
              {formatMessage({ id: `${intlPrefix}.connect.${key}.des` })}
            </span>
          </div>
        </div>
      ))}
    </>
  );
});

export default AllConnect;
