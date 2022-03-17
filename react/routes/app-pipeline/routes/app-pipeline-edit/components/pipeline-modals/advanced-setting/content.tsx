import React, { useState, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, SelectBox, NumberField,
} from 'choerodon-ui/pro';
import {
  Icon,
} from 'choerodon-ui';
import classnames from 'classnames';
import Lightbox from 'react-image-lightbox';
import StepTitle from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/step-title';
import { mapping } from './stores/advancedDataSet';
import { useAdvancedSettingStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores';
import previewImage from './images/image.png';

import './index.less';

const prefix = 'c7ncd-advanced-setting';

const Index = observer(() => {
  const {
    AdvancedDataSet,
    className,
    cRef,
    disabled,
  } = useAdvancedSettingStore();

  const [imageVisible, setImageVisible] = useState(false);
  const [visible, setVisible] = useState(true);

  useImperativeHandle(cRef, () => ({
    getDataSet: () => AdvancedDataSet,
  }));

  const renderTips = () => (
    <div className={`${prefix}-tips`}>
      <Icon className={`${prefix}-tips-info`} type="info" />
      <div className={`${prefix}-tips-content`}>
        <p>此处支持手动输入自定义镜像;</p>
        <p>
          若为私有镜像，还需注意以下事项:
        </p>
        <p>
          1、需要在
          <span
            role="none"
            onClick={() => {
              setImageVisible(!imageVisible);
            }}
          >
            流水线-高级设置-认证管理
            <Icon type="image-o" />
          </span>
          中维护对应的镜像仓库认证。
        </p>
        <p>
          2、请确保当前流水线的GitLab Runner版本在V13.1或以上。
        </p>
      </div>
    </div>
  );

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
          <>
            {renderTips()}
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
          </>
        )
      }
      {
        imageVisible ? (
          <Lightbox
            mainSrc={previewImage}
            onCloseRequest={() => setImageVisible(false)}
            imageTitle="image"
          />
        ) : ''
      }
    </div>
  );
});

export default Index;
