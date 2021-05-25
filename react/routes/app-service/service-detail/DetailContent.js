import React, { useEffect, useState } from 'react';
import { PageWrap, PageTab, Page } from '@choerodon/boot';
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
  } = useServiceDetailStore();

  const [tabValue, setTabValue] = useState('Version');

  const [tabData, setTabData] = useState([{
    name: formatMessage({ id: `${intlPrefix}.version` }),
    value: 'Version',
  }]);

  useEffect(() => {
    let newTabData = tabData;
    if (accessShare && detailDs.current && detailDs.current.get('type') === 'normal') {
      if (!tabData.find((i) => i.value === 'Share')) {
        newTabData = [
          ...tabData,
          {
            name: formatMessage({ id: `${intlPrefix}.share` }),
            value: 'Share',
          },
        ];
        setTabData(newTabData);
      }
    }
  }, [accessShare, detailDs.current]);

  return (
    <Page
      service={detailPermissions}
    >
      <p className="c7ncd-serviceDetail-title">{detailDs?.current?.get('name') || ''}</p>
      <CustomTabs
        data={tabData}
        onChange={(e, name, value) => setTabValue(value)}
      />
      {
        tabValue === 'Version' ? <Version /> : <Share />
      }
    </Page>
  );
});

export default DetailContent;
