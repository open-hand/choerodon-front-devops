import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Choerodon } from '@choerodon/boot';
import { HeaderButtons } from '@choerodon/master';
import { handlePromptError } from '../../../../../../utils';
import ValueModalContent from './values/Config';
import UpgradeModalContent from './upgrade';
import MarketUpgradeModalContent from './market-upgrade';
import { useResourceStore } from '../../../../stores';
import { useInstanceStore } from '../stores';
import {
  openAppConfigModal,
} from '@/components/appCenter-editModal';

const valuesKey = Modal.key();
const upgradeKey = Modal.key();
const redeployKey = Modal.key();
const marketUpgradeKey = Modal.key();

const IstModals = injectIntl(observer(() => {
  const {
    prefixCls,
    intlPrefix,
    intl: { formatMessage },
    resourceStore: {
      getSelectedMenu: {
        id,
        parentId,
      },
    },
    treeDs,
  } = useResourceStore();
  const {
    baseDs,
    casesDs,
    podsDs,
    istStore,
    detailsStore,
    tabs: {
      CASES_TAB,
      DETAILS_TAB,
      PODS_TAB,
    },
    checkIstExist,
    AppState: { currentMenuType: { id: projectId } },
  } = useInstanceStore();
  const modalStyle = useMemo(() => ({
    width: 'calc(100vw - 3.52rem)',
  }), []);

  function openValueModal() {
    const record = baseDs.current;
    if (!record) return;

    const appServiceVersionId = record.get('commandVersionId');
    const appServiceId = record.get('appServiceId');
    const isMarket = record.get('source') === 'market';
    const isMiddleware = record.get('source') === 'middleware';
    istStore.loadValue(projectId, id, appServiceVersionId, isMarket || isMiddleware);

    const deployVo = {
      id,
      parentId,
      projectId,
      appServiceVersionId,
      appServiceId,
    };
    Modal.open({
      key: valuesKey,
      title: formatMessage({ id: `${intlPrefix}.modal.values` }),
      drawer: true,
      okText: formatMessage({ id: 'deployment' }),
      style: modalStyle,
      children: <ValueModalContent
        store={istStore}
        vo={deployVo}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        formatMessage={formatMessage}
        refresh={afterDeploy}
        isMarket={isMarket}
        isMiddleware={isMiddleware}
      />,
      afterClose: () => {
        istStore.setUpgradeValue({});
      },
    });
  }

  function openUpgradeModal() {
    const record = baseDs.current;
    if (!record) return;

    const appServiceVersionId = record.get('appServiceVersionId');
    const appServiceId = record.get('appServiceId');
    const deployVo = {
      id,
      parentId,
      versionId: appServiceVersionId,
      appServiceId,
    };

    Modal.open({
      key: upgradeKey,
      title: formatMessage({ id: `${intlPrefix}.modal.modify` }),
      drawer: true,
      okText: formatMessage({ id: 'modify' }),
      style: modalStyle,
      children: <UpgradeModalContent
        store={istStore}
        vo={deployVo}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={afterDeploy}
      />,
      afterClose: () => {
        istStore.setUpgradeValue({});
      },
    });
  }

  function openMarketUpgradeModal() {
    const record = baseDs.current;
    if (!record) return;

    const [environmentId] = parentId.split('**');
    const defaultData = {
      instanceId: id,
      marketAppServiceId: record.get('appServiceId'),
      marketDeployObjectId: record.get('appServiceVersionId'),
      marketServiceName: record.get('appServiceName'),
      environmentId,
      applicationType: record.get('applicationType'),
    };

    Modal.open({
      key: marketUpgradeKey,
      title: formatMessage({ id: `${intlPrefix}.modal.upgrade.market` }),
      drawer: true,
      okText: formatMessage({ id: 'upgrade' }),
      style: modalStyle,
      children: <MarketUpgradeModalContent
        store={istStore}
        defaultData={defaultData}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={afterDeploy}
        isMiddleware={record.get('source') === 'middleware'}
      />,
    });
  }

  function getDs(key) {
    const dsMapping = {
      [CASES_TAB]: casesDs,
      [PODS_TAB]: podsDs,
    };
    return dsMapping[key];
  }

  function refresh() {
    checkIstExist().then((query) => {
      if (query) {
        treeDs.query();
        baseDs.query();
        const activeKey = istStore.getTabKey;
        if (activeKey === DETAILS_TAB) {
          detailsStore.loadResource(projectId, id);
        } else {
          const ds = getDs(activeKey);
          ds && ds.query();
        }
      }
    });
  }

  function openRedeploy() {
    const record = baseDs.current;
    if (!record) return;

    const versionName = record.get('commandVersion');

    Modal.open({
      key: redeployKey,
      title: formatMessage({ id: `${intlPrefix}.modal.redeploy` }),
      children: <FormattedMessage id={`${intlPrefix}.modal.redeploy.tips`} values={{ versionName }} />,
      onOk: redeploy,
    });
  }

  async function redeploy() {
    try {
      const result = await istStore.redeploy(projectId, id);
      if (handlePromptError(result, false)) {
        afterDeploy();
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }

  function afterDeploy() {
    detailsStore.setTargetCount({});
    refresh();
  }

  function getHeader() {
    const [envId] = parentId.split('**');
    const envRecord = treeDs.find((record) => record.get('key') === envId);
    const connect = envRecord && envRecord.get('connect');
    const record = baseDs.current;
    const status = record ? record.get('status') : '';
    const isMarket = record && ['middleware', 'market'].includes(record.get('source'));
    const isMiddleware = record?.get('source') === 'middleware';
    const appAvailable = record && record.get('currentVersionAvailable');
    const upgradeAvailable = record && record.get('upgradeAvailable');
    const btnDisabled = !connect || !status || (status !== 'failed' && status !== 'running');
    const marketDisable = isMarket && !appAvailable;
    const isOperating = status === 'operating';

    const buttons = [!isMiddleware && {
      name: formatMessage({ id: `${intlPrefix}.modal.values` }),
      icon: 'rate_review1',
      handler: openValueModal,
      display: !isOperating,
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.values'],
      disabled: btnDisabled || marketDisable,
      tooltipsConfig: {
        placement: 'bottom',
        title: !btnDisabled && marketDisable ? formatMessage({ id: `${intlPrefix}.instance.disable.message` }) : '',
      },
      disabledMessage: !btnDisabled ? formatMessage({ id: `${intlPrefix}.instance.disable.message` }) : null,
    },
    {
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.updateChart'],
      name: '修改应用',
      icon: 'add_comment-o',
      disabled: btnDisabled,
      display: !isOperating,
      handler: () => {
        openAppConfigModal({ ...record?.toData(), instanceId: record.get('id') } || {}, refresh);
      },
    },
    {
      name: formatMessage({ id: 'upgrade' }),
      icon: 'backup_line',
      handler: openMarketUpgradeModal,
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.market.upgrade'],
      display: isMarket && !isMiddleware,
      disabled: btnDisabled || marketDisable || !upgradeAvailable,
      tooltipsConfig: {
        placement: 'bottom',
        title: !btnDisabled && (marketDisable || !upgradeAvailable) ? formatMessage({ id: `${intlPrefix}.instance.disable.message${appAvailable ? '.upgrade' : ''}` }) : '',
      },
      disabledMessage: !btnDisabled ? formatMessage({ id: `${intlPrefix}.instance.disable.message${appAvailable ? '.upgrade' : ''}` }) : null,
    }, {
      name: formatMessage({ id: `${intlPrefix}.modal.redeploy` }),
      icon: 'redeploy_line',
      handler: openRedeploy,
      display: !isOperating,
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.redeploy'],
      disabled: btnDisabled || marketDisable,
      tooltipsConfig: {
        title: !btnDisabled && marketDisable ? formatMessage({ id: `${intlPrefix}.instance.disable.message` }) : '',
        placement: 'bottom',
      },
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }].filter(Boolean);

    return <HeaderButtons items={buttons} showClassName />;
  }

  return getHeader();
}));

export default IstModals;
