import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Select } from 'choerodon-ui/pro';
import { useAppCenterInstanceStore } from '@/routes/app-center/app-detail/components/instance/stores';
import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { CustomTabs } from '@choerodon/components';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import openWarnModal from '@/utils/openWarnModal';
import getTablePostData from '@/utils/getTablePostData';
import Details from './components/details';

import './index.less';

export default observer((props) => {
  const {
    InstanceListDataSet,
    AppState: {
      currentMenuType: {
        projectId,
      },
    },
    detailsStore,
    baseDs,
    casesDs,
    podsDs,
  } = useAppCenterInstanceStore();

  const {
    mainStore,
    appServiceId,
  } = useAppCenterDetailStore();

  const [selectedTab, setSelectedTab] = useState('event');

  const checkIstExist = () => {
    const envId = mainStore.getSelectedEnv.id;
    return detailsStore.checkExist({
      projectId,
      type: 'instance',
      envId,
      id: InstanceListDataSet?.current?.get('version'),
    }).then((isExist: any) => {
      if (!isExist) {
        console.log('warning');
        // TODO
        // openWarnModal(freshTree, intl.formatMessage);
      }
      return isExist;
    });
  };

  const queryData = () => {
    casesDs.reset();
    switch (selectedTab) {
      // case tabs.CASES_TAB:
      //   casesDs.query();
      //   break;
      case 'event':
        detailsStore.loadResource(projectId, InstanceListDataSet?.current?.get('version'));
        break;
      // case tabs.PODS_TAB:
      //   podsDs.query();
      //   break;
      default:
    }
  };

  useEffect(() => {
    const id = InstanceListDataSet?.current?.get('version');
    if (id) {
      checkIstExist().then((query: any) => {
        if (query) {
          // @ts-ignore
          baseDs.transport.read.url = `/devops/v1/projects/${projectId}/app_service_instances/${id}`;
          baseDs.query();
          // @ts-ignore
          casesDs.transport.read.url = `/devops/v1/projects/${projectId}/app_service_instances/${id}/events`;
          podsDs.transport.read = ({ data }: {
            data: any,
          }) => {
            const envId = mainStore.getSelectedEnv.id;
            const appId = appServiceId;
            const postData = getTablePostData(data);
            const param = `&app_service_id=${appId}`;
            return {
              url: `devops/v1/projects/${projectId}/pods/page_by_options?env_id=${envId}&instance_id=${InstanceListDataSet?.current?.get('version')}${param}`,
              method: 'post',
              data: postData,
            };
          };
          podsDs.transport.destroy = ({ data }: {
            data: any,
          }) => {
            const envId = mainStore.getSelectedEnv.id;
            const appId = appServiceId;
            const podId = data[0].id;
            return {
              url: `devops/v1/projects/${projectId}/pods/${podId}?env_id=${envId}`,
              method: 'delete',
            };
          };
          queryData();
        }
      });
    }
  }, [projectId, selectedTab, InstanceListDataSet?.current?.get('version')]);

  const versionOptionsRender = ({ record, text, value }: {
    record: Record
    text: string,
    value: string,
  }) => text;

  const versionRender = ({ record, text, value }: {
    record: Record,
    text: string,
    value: string,
  }) => {
    const item = record?.getField('version')?.options?.records.find((i) => String(i.get('id')) === String(value));
    return item ? (
      <span>
        {`${item?.get('code')}(${item?.get('version')})`}
      </span>
    ) : '';
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'event': return <Details />;
      default: return '';
    }
  };

  return (
    <div className="c7ncd-app_detail-instance">
      <div className="c7ncd-app_detail-instance-header">
        <Form className="c7ncd-app_detail-instance-version" labelLayout={'horizontal' as LabelLayoutType} dataSet={InstanceListDataSet}>
          <Select
            name="version"
            optionRenderer={versionOptionsRender}
            renderer={versionRender}
          />
        </Form>
        <CustomTabs
          selectedTabValue="event"
          onChange={(e, name, value) => {
            setSelectedTab(value);
          }}
          data={[{
            name: '实例事件',
            value: 'event',
          }, {
            name: '运行详情',
            value: 'detail',
          }, {
            name: 'Pod详情',
            value: 'pod',
          }]}
        />
      </div>
      {
        renderTabContent()
      }
    </div>
  );
});
