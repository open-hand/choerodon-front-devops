import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Page, Header, Content, stores,
} from '@choerodon/boot';
import _ from 'lodash';
import { deployReportList, developReportList } from './reportList';
import './Home.less';

const { AppState } = stores;

class Home extends Component {
  handleClickReport = (report) => {
    const { history, location: { search } } = this.props;
    history.push(`${report.link}${search}`);
  };

  render() {
    const { name } = AppState.currentMenuType;
    return (
      <Page className="c7n-region">
        <Header title={<FormattedMessage id="report.head" />} />
        <Content>
          <div className="c7n-reports-wrapper">
            {_.map(developReportList.concat(deployReportList), (item) => (
              <div
                role="none"
                className="c7n-devops-report"
                key={item.key}
                onClick={this.handleClickReport.bind(this, item)}
              >
                <div className="c7n-devops-report-pic">
                  <div className={`c7n-devops-report-picBox ${item.pic}`} />
                </div>
                <div className="c7n-devops-report-descr">
                  <div className="c7n-devops-report-title"><FormattedMessage id={`report.${item.key}.head`} /></div>
                  <p className="c7n-devops-report-text"><FormattedMessage id={`report.${item.key}.des`} /></p>
                </div>
              </div>
            ))}
          </div>
        </Content>
      </Page>
    );
  }
}

export default Home;
