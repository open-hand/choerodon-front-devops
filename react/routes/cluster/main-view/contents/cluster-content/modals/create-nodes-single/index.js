import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Select, SelectBox } from 'choerodon-ui/pro';
import NewTips from '@/components/new-tips';
import { map } from 'lodash';
import NodesCreate from '../create-nodes';

import './index.less';

const { Option } = Select;

const CreateBySingleCluster = observer((props) => {
  const {
    prefixCls,
    intlPrefix,
    formatMessage,
    mainStore,
    projectId,
    afterOk,
    nodesTypeDs,
    nodesBySingleDS,
    modalStore,
    singleNodeFormDs,
    modal,
  } = props;

  useEffect(() => {}, []);

  const renderRoleOpts = useCallback(() => (
    map(nodesTypeDs && nodesTypeDs.toData(), (item, index) => {
      const { value, text } = item;
      if (value === 'etcd') {
        return null;
      }
      return (
        <Option value={value} key={`${index}-${text}`}>
          <span>{text}</span>
        </Option>
      );
    })
  ), [nodesTypeDs]);

  async function handleSubmit() {
    nodesBySingleDS.forEach(async (nodeRecord) => {
      const res = await nodeRecord.validate();
      if (!res) {
        nodeRecord.set('hasError', true);
      }
    });
    const result = await singleNodeFormDs.validate();
    if (!result) {
      modalStore.setModalErrorMes('请完善节点信息');
      return false;
    }
    return true;
  }

  modal.handleOk(handleSubmit);

  return (
    <div className={`${prefixCls}-nodesCreateBySingle`}>
      <div className={`${prefixCls}-nodesCreateBySingle-form`}>
        <NewTips showHelp helpText="在已有集群中添加节点时，一次添加，仅支持同一类型的节点" />
        <Form dataSet={singleNodeFormDs}>
          <SelectBox
            name="role"
            colSpan={6}
            className={`${prefixCls}-nodesCreateBySingle-node`}
          >
            {renderRoleOpts()}
          </SelectBox>
        </Form>
      </div>
      <NodesCreate
        prefixCls={prefixCls}
        formatMessage={formatMessage}
        intlPrefix={intlPrefix}
        nodesTypeDs={nodesTypeDs}
        nodesDs={nodesBySingleDS}
        parentModal={modal}
        isSingle
      />
      {
        modalStore.modalErrorMes && (
        <span className={`${prefixCls}-nodesCreateBySingle-modal-errorMes`}>
          {modalStore.modalErrorMes}
        </span>
        )
      }
    </div>
  );
});

export default CreateBySingleCluster;
