import React, { useEffect, useState, useMemo } from 'react';
import { templateStepsApi, ciTemplateStepApi } from '@choerodon/master';
import { Dropdown, Menu, Button } from 'choerodon-ui/pro';
import { transformLoadDataItem } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';
import { handleOk } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/content';

const Index = ({
  ds,
  level,
  okProps,
}: any) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function init() {
      let res;
      if (level === 'project') {
        res = await templateStepsApi.getTemplateSteps(1);
      } else if (level === 'organization') {
        res = await ciTemplateStepApi.getOrgSteps();
      } else {
        res = await ciTemplateStepApi.getSiteSteps();
      }
      setData(res);
    }
    init();
  }, []);

  const handleMenuClick = (e: any) => {
    const { key } = e;
    ds.loadData([
      ...ds.toData(),
      transformLoadDataItem(JSON.parse(key), ds?.records.length),
    ]);
    handleOk({
      canWait: false,
      StepDataSet: ds,
      ...okProps,
    });
  };

  const renderMenuItem = (d: any) => {
    if (d.ciTemplateStepVOList && d.ciTemplateStepVOList.length > 0) {
      return (
        <Menu.SubMenu key={JSON.stringify(d)} title={d.name}>
          {
            d.ciTemplateStepVOList.map((i: any) => (
              <Menu.Item key={JSON.stringify(i)}>
                {i.name}
              </Menu.Item>
            ))
          }
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item key={JSON.stringify(d)}>
        {d.name}
      </Menu.Item>
    );
  };

  const menu = useMemo(() => (
    <Menu mode="vertical" onClick={handleMenuClick}>
      {data.map((item) => renderMenuItem(item))}
    </Menu>
  ), [data]);

  return (
    <Dropdown
      overlay={menu}
      // @ts-ignore
      getPopupContainer={() => document.querySelector('.c7ncd-buildModal-content')}
    >
      <Button
        icon="add"
      >
        添加步骤
      </Button>
    </Dropdown>
  );
};

export default Index;
