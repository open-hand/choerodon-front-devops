import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import EnvDetail from '../../../../../../components/env-detail';
import { useResourceStore } from '../../../../stores';
import { useREStore } from '../stores';

const REModals = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    treeDs,
  } = useResourceStore();
  const {
    baseInfoDs,
    resourceCountDs,
    gitopsLogDs,
    gitopsSyncDs,
  } = useREStore();

  function refresh() {
    baseInfoDs.query();
    resourceCountDs.query();
    treeDs.query();
    gitopsSyncDs.query();
    gitopsLogDs.query();
  }

  function linkToConfig() {
    const record = baseInfoDs.current;
    const url = record && record.get('gitlabUrl');
    url && window.open(url);
  }

  function openEnvDetail() {
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      children: <EnvDetail record={baseInfoDs.current} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  function getButtons() {
    return [{
      name: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      icon: 'find_in_page-o',
      handler: openEnvDetail,
      display: true,
    }, {
      name: formatMessage({ id: `${intlPrefix}.environment.config-lab` }),
      icon: 'account_balance',
      handler: linkToConfig,
      display: true,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default REModals;
