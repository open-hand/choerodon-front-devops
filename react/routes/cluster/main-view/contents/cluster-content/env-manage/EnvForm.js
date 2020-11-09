import React, { useEffect } from 'react';

import {
  Form, SelectBox, TextField, Select, NumberField, Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import Tips from '@/components/new-tips';

const { Option } = Select;

const EnvForm = observer((props) => {
  const {
    EnvQuotaFormDs,
  } = props;

  useEffect(() => {

  }, []);

  const getSuffix = (value) => (
    <span className="c7ncd-cluster-envQuota-suffix">
      {value}
    </span>
  );

  return (
    <div className="c7ncd-cluster-envQuota">
      <div className="c7ncd-cluster-envQuota-form">
        <Form
          dataSet={EnvQuotaFormDs}
        >
          <SelectBox name="isCheckQuota" className="c7ncd-cluster-envQuota-enabled">
            <Option value>是</Option>
            <Option value={false}>否</Option>
          </SelectBox>
        </Form>
        <Tips helpText="hello" />
      </div>
      {
        EnvQuotaFormDs.current.get('isCheckQuota') && (
          <>
            <div className="c7ncd-cluster-envQuota-form">
              <Form
                dataSet={EnvQuotaFormDs}
              >
                <TextField name="CPULimit" suffix={getSuffix('milli CPUs')} />
                <TextField name="CPURquest" suffix={getSuffix('milli CPUs')} />
              </Form>
            </div>
            <div className="c7ncd-cluster-envQuota-form">
              <Form
                dataSet={EnvQuotaFormDs}
              >
                <TextField name="memoryLimit" suffix={getSuffix('MiB')} />
                <TextField name="memoryRequest" suffix={getSuffix('MiB')} />
              </Form>
            </div>
          </>
        )
      }
    </div>
  );
});

export default EnvForm;
