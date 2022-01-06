/* eslint-disable no-underscore-dangle */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Select, Modal } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content } from '@choerodon/master';
import _ from 'lodash';
import uuidv1 from 'uuid';
import Cookies from 'universal-cookie';
import { removeEndsChar } from '../../utils';
import Term from '../term';

import '../log-siderbar/index.less';

const { Sidebar } = Modal;
const { Option } = Select;

const cookies = new Cookies();
const getAccessToken = () => cookies.get('access_token');

@observer
@injectIntl
export default class TermSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerName: '',
      logId: null,
    };
  }

  componentDidMount() {
    const { record: { containers } } = this.props;
    const { name, logId } = containers[0];
    this.setState({ containerName: name, logId });
  }

  handleChange = (value) => {
    const [logId, containerName] = value.split('+');
    // eslint-disable-next-line react/destructuring-assignment
    if (logId !== this.state.logId) {
      this.setState({
        containerName,
        logId,
      });
    }
  };

  render() {
    const {
      visible, onClose, record, projectId: propsProjectId, clusterId: propsClusterId,
    } = this.props;
    const { logId, containerName } = this.state;
    const { namespace, name: podName, containers } = record || {};
    const clusterId = propsClusterId || record?.clusterId;
    const projectId = propsProjectId || record?.projectId;
    const wsUrl = removeEndsChar(window._env_.DEVOPS_HOST, '/');

    // const authToken = document.cookie.split('=')[1];
    const key = `cluster:${clusterId}.exec:${uuidv1()}`;
    const secretKey = window._env_.DEVOPS_WEBSOCKET_SECRET_KEY;
    const url = `${wsUrl}/websocket?key=${key}&group=from_front:${key}&processor=front_exec&secret_key=${secretKey}&env=${namespace}&podName=${podName}&containerName=${containerName}&logId=${logId}&clusterId=${clusterId}&oauthToken=${getAccessToken()}&projectId=${projectId}`;

    const containerOptions = _.map(containers, (container) => {
      const { logId: id, name } = container;
      return (
        <Option key={logId} value={`${id}+${name}`}>
          {name}
        </Option>
      );
    });

    return (
      <Sidebar
        visible={visible}
        title={<FormattedMessage id="container.term" />}
        onOk={onClose}
        className="c7n-container-sidebar c7n-region"
        okText={<FormattedMessage id="close" />}
        okCancel={false}
      >
        <Content
          className="sidebar-content"
        >
          <div className="c7n-container-sidebar-content">
            <div className="c7n-term-title">
              <FormattedMessage id="container.term.ex" />
            &nbsp;
              <Select className="c7n-log-siderbar-select" value={containerName} onChange={this.handleChange}>
                {containerOptions}
              </Select>
            </div>
            <div className="c7n-term-wrap">
              {logId && <Term url={url} id={logId} />}
            </div>
          </div>
        </Content>
      </Sidebar>
    );
  }
}
