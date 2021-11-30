import React, { useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Form, Modal, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import PipelineCreate from '@/routes/pipeline-manage/components/PipelineCreate';

export default observer(({
  ds, modal, projectId, editBlockStore, record, handleRefresh, seletDs,
}) => {
  useEffect(() => {
    ds.reset();
    seletDs.query();
    return function () {
      seletDs.reset();
    };
  }, []);

  useEffect(() => {
    modal.update({
      okProps: {
        disabled: !ds.current.get('appServiceId'),
      },
    });
  }, [ds.current.get('appServiceId')]);

  modal.handleOk(async () => {
    const oldMainData = JSON.parse(JSON.stringify(editBlockStore.getMainData));
    const result = await editBlockStore.loadDetail(projectId, record.get('id'));
    const appServiceName = seletDs.toData().find((item) => item.appServiceId === ds.current.get('appServiceId').appServiceId)?.appServiceName;
    editBlockStore.setMainData({
      ...result,
      devopsCdStageVOS: [],
      name: undefined,
      appServiceId: ds.current.get('appServiceId').appServiceId,
      appServiceName,
    });
    editBlockStore.setStepData([...result.devopsCiStageVOS]);
    const { appServiceId } = ds.current.get('appServiceId');
    Modal.open({
      key: Modal.key(),
      title: '创建流水线',
      style: {
        width: 'calc(100vw - 3.52rem)',
      },
      drawer: true,
      children: <PipelineCreate
        appService={{
          id: appServiceId,
          name: appServiceName,
        }}
        oldMainData={oldMainData}
        dataSource={editBlockStore.getMainData}
        refreshTree={handleRefresh}
        editBlockStore={editBlockStore}
      />,
      okText: '创建',
    });
    return true;
  });

  const renderer = ({ text }) => text;

  const optionRenderer = ({ text }) => (text === '加载更多' ? (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      role="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={handleClickMore}
    >
      {text}
    </a>
  ) : text);

  const handleOnInput = (e) => {
    e.persist();
    searchVersion(e.target.value);
  };
  const searchVersion = useMemo(
    () => debounce((value) => {
      if (value) {
        seletDs.setQueryParameter('params', { appServiceName: value });
        seletDs.query();
      }
    }, 500),
    [],
  );
  const handleBlur = () => {
    seletDs.setQueryParameter('params', { appServiceName: '' });
    seletDs.query();
  };

  const handleClickMore = async (e) => {
    e.stopPropagation();
    const pageSize = seletDs.pageSize + 20;
    // eslint-disable-next-line no-param-reassign
    seletDs.pageSize = pageSize;
    seletDs.setQueryParameter('params', { size: pageSize });
    seletDs.query();
  };

  return (
    <div>
      <p>
        请为新的流水线选择关联应用服务
      </p>
      <Form dataSet={ds}>
        <Select
          name="appServiceId"
          searchable
          onInput={handleOnInput}
          onBlur={handleBlur}
          searchMatcher="appServiceName"
          optionRenderer={optionRenderer}
          renderer={renderer}
        />
      </Form>
    </div>
  );
});
