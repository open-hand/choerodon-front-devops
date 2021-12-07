/* eslint-disable react/jsx-no-bind */
import React, {
  Fragment, useCallback, useState, useEffect, useMemo,
} from 'react';
import {
  Table, Select, Form, TextField, Icon,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/master';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import forEach from 'lodash/forEach';
import map from 'lodash/map';

import './index.less';

const { Column } = Table;
const { Option } = Select;

const SourceTable = injectIntl(
  observer(
    ({
      tableDs,
      selectedDs,
      store,
      projectId,
      importRecord,
      intl: { formatMessage },
      intlPrefix,
      prefixCls,
      modal,
    }) => {
      const selectedId = useMemo(() => selectedDs.map((record) => record.get('id')), [selectedDs]);
      const options = useMemo(
        () => map(store.getAllProject, ({ id, name }) => <Option value={id}>{name}</Option>),
        [store.getAllProject],
      );
      const [param, setParam] = useState('');
      const [searchProjectId, setSearchProjectId] = useState(null);

      useEffect(() => {
        store.loadAllProject(projectId, importRecord.get('platformType') === 'share');
        loadData();
      }, []);

      modal.handleOk(() => {
        const records = [];
        const newSelectedId = [];
        forEach(tableDs.selected, (record) => {
          if (!includes(selectedId, record.get('id'))) {
            records.push(record);
          }
          newSelectedId.push(record.get('id'));
        });
        const deleteRecords = selectedDs.filter(
          (record) => !includes(newSelectedId, record.get('id')),
        );
        selectedDs.remove(deleteRecords);
        selectedDs.push(...records);
      });

      async function loadData() {
        try {
          if ((await tableDs.query()) !== false) {
            forEach(selectedId, (id) => {
              tableDs.select(tableDs.find((tableRecord) => tableRecord.get('id') === id));
            });
          }
        } catch (e) {
          Choerodon.handleResponseError(e);
        }
      }

      function handleSelectProject(value) {
        setSearchProjectId(value);
        tableDs.setQueryParameter('search_project_id', value);
        tableDs.setQueryParameter('param', param);
        loadData();
      }

      function handleChangeParam(value) {
        setParam(value);
        tableDs.setQueryParameter('search_project_id', searchProjectId);
        tableDs.setQueryParameter('param', value);
        loadData();
      }

      return (
        <div>
          <Form columns={3}>
            <Select
              label={formatMessage({
                id: `${intlPrefix}.belong.${importRecord.get('platformType')}`,
              })}
              onChange={handleSelectProject}
            >
              {options}
            </Select>
            <TextField
              onChange={handleChangeParam}
              colSpan={2}
              prefix={<Icon type="search" className={`${prefixCls}-prefix-icon`} />}
              placeholder={formatMessage({ id: `${intlPrefix}.param` })}
            />
          </Form>
          <Table dataSet={tableDs} queryBar="none">
            <Column name="name" />
            <Column name="code" />
            <Column
              name="projectName"
              header={formatMessage({
                id: `${intlPrefix}.belong.${importRecord.get('platformType')}`,
              })}
            />
          </Table>
        </div>
      );
    },
  ),
);

export default SourceTable;
