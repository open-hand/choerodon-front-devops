import React, {
  useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  SelectBox,
  Select,
  Tooltip,
} from 'choerodon-ui/pro';
import { axios } from '@choerodon/master';
import {
  Record, RecordObjectProps,
} from '@/interface';
import EnvOption from '@/components/env-option';
import { useHzeroDeployStore } from './stores';
import ServiceContent from './components/service-content';

import './index.less';

const HzeroDeploy = observer(() => {
  const {
    prefixCls,
    modal,
    formDs,
    serviceDs,
    refresh,
  } = useHzeroDeployStore();

  modal.handleOk(async () => {
    try {
      const [res1, res2] = await axios.all([formDs.validate(), serviceDs.validate()]);
      if (res1 && res2) {
        await formDs.submit();
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const renderEnvOption = useCallback(({
    record, text,
  }: { record: Record, text: string }):any => (
    <EnvOption record={record} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission') || !envRecord.get('connect'),
  }), []);

  const renderTypeOptionProperty = useCallback(({ record: typeRecord }: RecordObjectProps) => ({
    disabled: typeRecord.get('disabled'),
  }), []);

  const renderTypeOption = useCallback(({ record, text }) => (
    <Tooltip
      title={record.get('disabled') ? `平台中未同步${text}，暂不可选择` : ''}
      placement="top"
    >
      <span>{text}</span>
    </Tooltip>
  ), []);
  return (
    <div className={`${prefixCls}`}>
      <Form dataSet={formDs} columns={6}>
        <SelectBox
          name="appType"
          colSpan={2}
          onOption={renderTypeOptionProperty}
          optionRenderer={renderTypeOption}
        />
        <Select
          name="envId"
          searchable
          clearButton={false}
          optionRenderer={renderEnvOption}
          onOption={renderOptionProperty}
          colSpan={2}
        />
        <Select
          name="mktAppVersion"
          searchable
          clearButton={false}
          colSpan={2}
        />
      </Form>
      <ServiceContent />
    </div>
  );
});

export default HzeroDeploy;
