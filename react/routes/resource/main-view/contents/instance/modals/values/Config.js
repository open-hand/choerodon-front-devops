import React, { useState, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import { Choerodon } from '@choerodon/master';
import YamlEditor from '../../../../../../../components/yamlEditor';
import InterceptMask from '../../../../../../../components/intercept-mask';
import { handlePromptError } from '../../../../../../../utils';

import './index.less';

const ValueModalContent = observer((
  {
    modal,
    store,
    formatMessage,
    intlPrefix,
    prefixCls,
    vo,
    refresh,
    isMarket,
    isMiddleware,
  },
) => {
  const [value, setValue] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { yaml, name } = store.getUpgradeValue;

  modal.handleOk(handleOk);

  // eslint-disable-next-line consistent-return
  async function handleOk() {
    if (isDisabled) return false;
    setIsLoading(true);
    const {
      id, parentId, projectId, appServiceVersionId, appServiceId,
    } = vo;
    const [envId] = parentId.split('**');

    const data = {
      values: value || yaml || '',
      instanceId: id,
      type: 'update',
      environmentId: envId,
    };

    if (isMarket || isMiddleware) {
      data.marketAppServiceId = appServiceId;
      data.marketDeployObjectId = appServiceVersionId;
    } else {
      data.appServiceId = appServiceId;
      data.appServiceVersionId = appServiceVersionId;
    }

    try {
      const result = await store.upgrade(projectId, data, isMarket, isMiddleware);
      if (handlePromptError(result)) {
        Choerodon.prompt('修改成功.');
        refresh && refresh();
      } else {
        Choerodon.prompt('修改失败.');
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }

  function toggleOkDisabled(flag) {
    modal.update({ okProps: { disabled: flag } });
  }

  function handleChange(nextValue) {
    setValue(nextValue);
  }

  function handleEnableNext(flag) {
    setIsDisabled(flag);
    toggleOkDisabled(flag);
  }

  return (
    <>
      <div className={`${prefixCls}-instance-upgrade-tips`}>
        <strong>注意：</strong>
        <span>
          <br />
          - 在变更实例时，Chart包内或者values中控制副本数量的配置将不会生效，而是会和现有生效的实例的副本数保持一致。
          <br />
          - 若想修改副本数量，请在部署后前往运行详情页面中更改Pod数量即可。
          <br />
          - 下方values中其他参数字段修改后依然会生效。
        </span>
      </div>
      <Spin spinning={store.getValueLoading}>
        <YamlEditor
          readOnly={false}
          value={value || yaml || ''}
          originValue={yaml}
          onValueChange={handleChange}
          handleEnableNext={handleEnableNext}
        />
      </Spin>
      <InterceptMask visible={isLoading} />
    </>
  );
});

export default ValueModalContent;
