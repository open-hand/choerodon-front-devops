import React, { useState, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, SelectBox, NumberField,
} from 'choerodon-ui/pro';
import classnames from 'classnames';
import StepTitle from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/step-title';
import { mapping } from './stores/advancedDataSet';
import { useAdvancedSettingStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores';

import './index.less';

const prefix = 'c7ncd-advanced-setting';

const Index = observer(() => {
  const {
    AdvancedDataSet,
    className,
    cRef,
    disabled,
  } = useAdvancedSettingStore();

  const [visible, setVisible] = useState(true);

  useImperativeHandle(cRef, () => ({
    getDataSet: () => AdvancedDataSet,
  }));

  return (
    <div className={classnames({
      [prefix]: true,
      [className as string]: Boolean(className),
    })}
    >
      <StepTitle
        title="高级设置"
        buttons={[{
          text: visible ? '隐藏高级设置' : '显示高级设置',
          icon: visible ? 'visibility_off-o' : 'tune',
          onClick: () => {
            setVisible(!visible);
          },
        }]}
      />
      {
        visible && (
          <Form disabled={disabled} columns={2} className={`${prefix}__form`} dataSet={AdvancedDataSet}>
            <Select combo colSpan={2} name={mapping.ciRunnerImage.name} />
            <SelectBox
              colSpan={2}
              name={mapping.shareFolderSetting.name}
              className={`${prefix}__form__share`}
            />
            <SelectBox name={mapping.whetherConcurrent.name} />
            {
              AdvancedDataSet?.current?.get(mapping.whetherConcurrent.name) && (
                <NumberField name={mapping.concurrentCount.name} />
              )
            }
          </Form>
        )
      }
    </div>
  );
});

export default Index;
