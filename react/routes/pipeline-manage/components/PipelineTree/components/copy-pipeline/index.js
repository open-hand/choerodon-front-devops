import React, { useEffect } from 'react';
import { Form, Modal, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import PipelineCreate from '@/routes/pipeline-manage/components/PipelineCreate';

export default observer(({
  ds, modal, projectId, editBlockStore, record, handleRefresh,
}) => {
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
    editBlockStore.setMainData({
      ...result,
      devopsCdStageVOS: [],
      // stageList: result.stageList.filter(s => s.type === 'CI')
    });
    editBlockStore.setStepData([...result.devopsCiStageVOS]);
    const appServiceId = ds.current.get('appServiceId');
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
          name: ds.getField('appServiceId').lookup.find((item) => item.appServiceId === appServiceId).appServiceName,
        }}
        oldMainData={oldMainData}
        dataSource={editBlockStore.getMainData}
        refreshTree={handleRefresh}
        editBlockStore={editBlockStore}
      />,
      okText: '创建',
    });
  });

  const renderer = ({ text }) => text;

  const optionRenderer = ({ text }) => (text === '加载更多' ? (
    <a
      role="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={handleClickMore}
    >
      {text}
    </a>
  ) : text);

  const handleClickMore = async (e) => {
    e.stopPropagation();
    const pageSize = ds.current.get('pageSize') + 20;
    const result = await axios.post(`/devops/v1/projects/${projectId}/app_service/page_app_services_without_ci?page=0&size=${pageSize}`);
    if (result.length % 20 === 0) {
      result.push({
        appServiceId: 'more',
        appServiceName: '加载更多',
      });
    }
    ds.current.set('pageSize', pageSize);
    // eslint-disable-next-line no-param-reassign
    ds.getField('appServiceId').props.lookup = result;
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
          searchMatcher="appServiceName"
          optionRenderer={optionRenderer}
          renderer={renderer}
        />
      </Form>
    </div>
  );
});
