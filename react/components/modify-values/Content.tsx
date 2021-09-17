import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin, message } from 'choerodon-ui';
import { axios } from '@choerodon/boot';
import YamlEditor from '@/components/yamlEditor';
import InterceptMask from '@/components/intercept-mask';

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
    valuesDs,
    projectId,
  } = useModifyValuesStore();

  const [value, setValue] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const yaml = valuesDs.current?.get('yaml');

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
      values: value || yaml || '',
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
      const res = await upgrade(data);
      if (res && res.failed) {
        message.error('修改失败');
        return false;
      }
      modal.close();
      message.success('修改成功');
      refresh && refresh();
      return true;
    } catch (e) {
      modal.close();
      throw new Error(e);
    }
  }

  function toggleOkDisabled(flag:boolean) {
    modal.update({ okProps: { disabled: flag } });
  }

  function handleChange(nextValue:string) {
    setValue(nextValue);
  }

  function handleEnableNext(flag:boolean) {
    setIsDisabled(flag);
    toggleOkDisabled(flag);
  }

  modal.handleOk(handleOk);

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
