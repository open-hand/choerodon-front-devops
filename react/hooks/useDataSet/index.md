---
nav:
  title: Hooks
  path: /hooks
group:
  path: /hooks/data
  title: '数据相关'
---

## useDataSet

useDataSet 针对 dataset 做了 useMemo 的封装，以及抛出了 ds 的一些操作方法

代码演示:

```tsx
/**
 * title: 基本使用
 */
import React, { useMemo } from 'react';
import { useDataSet } from '@choerodon/components';

const MyDataSet = () => ({
  autoQuery: true,
  transport: {},
});

const Test = () => {
  const [activeKey, setActiveKey] = useTabActiveKey('1');
  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <TabPane key="1" tab="1">
        1
      </TabPane>
      <TabPane key="2" tab="2">
        2
      </TabPane>
    </Tabs>
  );
};
export default Test;
```
