import React, {
  memo, useMemo, Fragment, useImperativeHandle,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Header, Permission, Choerodon } from '@choerodon/master';
import { Button, Tooltip } from 'choerodon-ui';
import { Modal, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { useAppTopStore } from '../stores';
import { useServiceDetailStore } from './stores';
import Detail from './modals/detail';
import EditForm from '../modals/edit-form';
import { handlePromptError } from '../../../utils';

const modalKey1 = Modal.key();
const modalKey3 = Modal.key();
const editModalKey = Modal.key();
const modalStyle = {
  width: 380,
};

const HeaderButtons = observer(({ children, theme4 }) => {
  const {
    intlPrefix,
    prefixCls,
    appServiceStore,
  } = useAppTopStore();
  const {
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
    detailDs,
    cRef,
  } = useServiceDetailStore();

  const serviceActive = useMemo(() => detailDs.current && detailDs.current.get('active'), [detailDs.current]);
  const detailCurrent = useMemo(() => detailDs.current, [detailDs.current]);

  useImperativeHandle(cRef, () => ({
    openDetail,
  }));

  const refresh = () => {
    detailDs.query();
  };

  const openDetail = (record) => {
    Modal.open({
      key: modalKey1,
      title: formatMessage({ id: `${intlPrefix}.detail` }),
      children: <Detail
        record={record}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        formatMessage={formatMessage}
      />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
    });
  };

  const openEdit = () => {
    const appServiceId = detailCurrent.get('id');

    Modal.open({
      key: editModalKey,
      drawer: true,
      style: modalStyle,
      title: formatMessage({ id: `${intlPrefix}.edit` }),
      children: <EditForm
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        appServiceId={appServiceId}
      />,
      okText: formatMessage({ id: 'save' }),
    });
  };

  function getActiveText() {
    const active = serviceActive ? 'disable' : 'enable';
    return <FormattedMessage id={`${intlPrefix}.${active}`} />;
  }

  function openStop(record) {
    const id = record.get('id');

    const stopModal = Modal.open({
      key: modalKey3,
      title: formatMessage({ id: `${intlPrefix}.check` }),
      children: <Spin />,
      footer: null,
    });

    appServiceStore.checkAppService(projectId, id).then((res) => {
      if (handlePromptError(res)) {
        const { checkResources, checkRule } = res;
        const status = checkResources || checkRule;
        let childrenContent;

        if (!status) {
          childrenContent = <FormattedMessage id={`${intlPrefix}.stop.tips`} />;
        } else if (checkResources && !checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.resource` });
        } else if (!checkResources && checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.rules` });
        } else {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.both` });
        }

        const statusObj = {
          title: status ? formatMessage({ id: `${intlPrefix}.cannot.stop` }) : formatMessage({ id: `${intlPrefix}.stop` }, { name: detailDs.current.get('name') }),
          // eslint-disable-next-line no-nested-ternary
          children: childrenContent,
          okCancel: !status,
          onOk: () => (status ? stopModal.close() : handleChangeActive(false)),
          okText: status ? formatMessage({ id: 'iknow' }) : formatMessage({ id: 'stop' }),
          footer: ((okBtn, cancelBtn) => (
            <>
              {!status && cancelBtn}
              {okBtn}
            </>
          )),
        };
        stopModal.update(statusObj);
      } else {
        stopModal.close();
      }
    }).catch((err) => {
      stopModal.close();
      Choerodon.handleResponseError(err);
    });
  }

  // eslint-disable-next-line consistent-return
  async function handleChangeActive(active) {
    const { current } = detailDs;
    try {
      if (await appServiceStore.changeActive(projectId, current.get('id'), active) !== false) {
        detailDs.query();
      } else {
        return false;
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  return theme4 ? children : (
    <Header>
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.update']}
      >
        <Tooltip
          title={!serviceActive ? <FormattedMessage id={`${intlPrefix}.button.disabled`} /> : ''}
          placement="bottom"
        >
          <Button
            icon="mode_edit "
            onClick={openEdit}
            disabled={!serviceActive}
          >
            <FormattedMessage id={`${intlPrefix}.edit`} />
          </Button>
        </Tooltip>
      </Permission>
      <Permission
        service={[serviceActive ? 'choerodon.code.project.develop.app-service.ps.disable' : 'choerodon.code.project.develop.app-service.ps.enable']}
      >
        <Button
          icon={serviceActive ? 'remove_circle_outline' : 'finished'}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={
            serviceActive
              ? openStop.bind(this, detailCurrent) : handleChangeActive.bind(this, true)
          }
        >
          {getActiveText()}
        </Button>
      </Permission>
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.default']}
      >
        <Button
          icon="find_in_page"
          onClick={openDetail}
        >
          <FormattedMessage id={`${intlPrefix}.detail`} />
        </Button>
      </Permission>
      {children}
    </Header>
  );
});

export default HeaderButtons;
