import React, { useState, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import { Choerodon, axios } from '@choerodon/boot';
import YamlEditor from '@/components/yamlEditor';
import InterceptMask from '@/components/intercept-mask';
import { handlePromptError } from '@/utils';

import './index.less';
import { useModifyValuesStore } from './stores';

const prefixCls = 'c7ncd-modify_values';

const ValueModalContent = observer(() => {
  const {
    modal,
    refresh,
    isMarket,
    isMiddleware,
    instanceId,
    appServiceId,
    appServiceVersionId,
    envId,
  } = useModifyValuesStore();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    valuesDs,
    projectId,
  } = useModifyValuesStore();

  const yaml = valuesDs.current?.get('yaml');

  modal.handleOk(handleOk);

  function upgrade(data:any) {
    const url = isMiddleware
      ? `/devops/v1/projects/${projectId}/middleware/redis/${data.instanceId}`
      : `/devops/v1/projects/${projectId}/app_service_instances${isMarket ? `/market/instances/${data.instanceId}` : ''}`;
    return axios.put(url, JSON.stringify(data));
  }

  async function handleOk() {
    if (isDisabled) return false;
    setIsLoading(true);

    const data:any = {
      values: yaml || '',
      instanceId,
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
      const result = await upgrade(data);
      if (handlePromptError(result)) {
        Choerodon.prompt('修改成功.');
        refresh();
      } else {
        Choerodon.prompt('修改失败.');
        return false;
      }
      return true;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  function toggleOkDisabled(flag:boolean) {
    modal.update({ okProps: { disabled: flag } });
  }

  function handleChange(nextValue:string) {
    valuesDs.current?.set('yaml', nextValue);
  }

  function handleEnableNext(flag:boolean) {
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
      <Spin spinning={valuesDs.status === 'loading'}>
        <YamlEditor
          readOnly={false}
          value={yaml || ''}
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
