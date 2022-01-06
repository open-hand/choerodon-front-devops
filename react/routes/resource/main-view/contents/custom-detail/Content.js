/* eslint-disable no-underscore-dangle */

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import uuidv1 from 'uuid';
import Cookies from 'universal-cookie';
import { Loading } from '@choerodon/components';
import ResourceTitle from '../../components/resource-title';
import { removeEndsChar } from '../../../../../utils';
import { useResourceStore } from '../../../stores';
import { useCustomDetailStore } from './stores';
import Modals from './modals';

import './index.less';

const TIMEOUT_TIME = 50000;

const cookies = new Cookies();
const getAccessToken = () => cookies.get('access_token');

const Content = observer(() => {
  const { prefixCls, AppState: { currentMenuType: { projectId } } } = useResourceStore();
  const [value, setValue] = useState('暂无数据');
  const [loading, setLoading] = useState(true);
  const { detailDs } = useCustomDetailStore();
  let ws;
  let retry = false;

  useEffect(() => {
    initSocket();
    return () => {
      if (ws) {
        destroySocket();
      }
    };
  }, [detailDs.current]);

  function destroySocket() {
    ws.removeEventListener('message', handleMessage);
    ws.removeEventListener('error', handleError);
    ws.close();
  }

  function initSocket() {
    setLoading(true);
    const record = detailDs.current;
    if (record) {
      const id = record.get('id');
      const clusterId = record.get('clusterId');
      const name = record.get('name');
      const kind = record.get('k8sKind');
      const env = record.get('envCode');
      try {
        const wsHost = removeEndsChar(window._env_.DEVOPS_HOST, '/');
        const key = `cluster:${clusterId}.describe:${uuidv1()}`;
        const secretKey = window._env_.DEVOPS_WEBSOCKET_SECRET_KEY;
        const url = `${wsHost}/websocket?key=${key}&group=from_front:${key}&processor=front_describe&secret_key=${secretKey}&env=${env}&kind=${kind}&name=${name}&describeId=${id}&clusterId=${clusterId}&oauthToken=${getAccessToken()}&projectId=${projectId}`;
        ws = new WebSocket(url);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('error', handleError);
      } catch (e) {
        setValue('请求失败，请稍后重试！');
      }
    }
  }

  function handleMessage({ data }) {
    try {
      const { message } = JSON.parse(data) || {};
      const newMessage = message && JSON.parse(message) ? JSON.parse(message).payload || '' : '';
      setValue(newMessage);
      setLoading(false);
      destroySocket();
    } catch (e) {
      setValue('请求失败，请稍后重试！');
    }
  }

  function handleError(e) {
    setValue(JSON.stringify(e));

    if (!retry) {
      retry = true;
      setTimeout(() => {
        retry = false;
        destroySocket();
        initSocket();
      }, TIMEOUT_TIME);
    }
  }

  return (
    <div className={`${prefixCls}-custom-detail`}>
      <ResourceTitle
        iconType="filter_b_and_w"
        record={detailDs.current}
        statusKey="commandStatus"
        errorKey="commandErrors"
      />
      <pre className="custom-detail-section-content">
        {loading ? <Loading display type="c7n" /> : value}
      </pre>
      <Modals />
    </div>
  );
});

export default Content;
