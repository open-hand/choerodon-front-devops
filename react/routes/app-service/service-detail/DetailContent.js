import React, { useEffect, useState } from 'react';
import {
  PageWrap, PageTab, Page, useFormatMessage,
} from '@choerodon/master';
import { Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { CustomTabs } from '@choerodon/components';
import { useAppTopStore } from '../stores';
import { useServiceDetailStore } from './stores';
import Version from './Version';
import Allocation from './Allocation';
import Share from './Share';
import Tips from '../../../components/new-tips';

const DetailContent = observer(() => {
  const {
    intlPrefix,
    detailPermissions,
    appServiceStore,
    AppState,
  } = useAppTopStore();

  const format = useFormatMessage('c7ncd.appService');

  if (AppState.getCurrentTheme === 'theme4') {
    import('./theme4.less');
  }

  const {
    intl: { formatMessage },
    detailDs,
    access: {
      accessPermission,
      accessShare,
    },
    versionDs,
    shareDs,
    type,
  } = useServiceDetailStore();

  const [tabValue, setTabValue] = useState('Version');

  const [tabData, setTabData] = useState([{
    name: format({ id: 'ServiceVersion' }),
    value: 'Version',
  }]);

  useEffect(() => {
    let newTabData = tabData;
    let flag = false;
    if (accessShare && detailDs.current && detailDs.current.get('type') === 'normal') {
      flag = true;
      shareDs.query();
      if (!tabData.find((i) => i.value === 'Share')) {
        newTabData = [
          ...tabData,
          {
            name: format({ id: 'SharingSetting' }),
            value: 'Share',
          },
        ];
        setTabData(newTabData);
      }
    }
    if (!flag) {
      setTabData([{
        name: format({ id: 'ServiceVersion' }),
        value: 'Version',
      }]);
    }
  }, [accessShare, detailDs.current]);

  useEffect(() => {
    if (type === 'test') {
      setTabValue('Version');
    }
  }, [type]);
  return (
    <Page
      service={detailPermissions}
    >
      <p className="c7ncd-serviceDetail-title">{detailDs?.current?.get('name') || ''}</p>
      <CustomTabs
        data={tabData}
        onChange={(e, name, value) => setTabValue(value)}
        selectedTabValue={tabValue}
      />
      {
        tabValue === 'Version' ? <Version /> : <Share />
      }
    </Page>
  );
});

export default DetailContent;
