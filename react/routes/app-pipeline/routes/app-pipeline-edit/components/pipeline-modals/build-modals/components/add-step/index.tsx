import React, { useEffect, useState, useMemo } from 'react';
import { templateStepsApi } from '@choerodon/master';
import { Dropdown, Menu, Button } from 'choerodon-ui/pro';
import { transformLoadDataItem } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';

const Index = ({
  ds,
}: any) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function init() {
      const res = await templateStepsApi.getTemplateSteps(1);
      setData(res);
    }
    init();
  }, []);

  const handleMenuClick = (e: any) => {
    const { key } = e;
    console.log(transformLoadDataItem(JSON.parse(key)));
    ds.create(transformLoadDataItem(JSON.parse(key)));
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
    <Dropdown overlay={menu}>
      <Button
        icon="add"
      >
        添加步骤
      </Button>
    </Dropdown>
  );
};

export default Index;
