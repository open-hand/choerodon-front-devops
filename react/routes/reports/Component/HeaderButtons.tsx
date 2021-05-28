import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { HeaderButtons } from '@choerodon/master';
import map from 'lodash/map';
import filter from 'lodash/filter';
import { developReportList, reportListMap } from '../Home/reportList';

interface ReportHeaderButtonsProps {
  refresh(): void,
  // eslint-disable-next-line react/require-default-props
  backPath?: string,
  reportType: 'develop' | 'deploy',
  reportKey: string,
  intl: { formatMessage(arg1: any): string }
}

const ReportsHeaderButtons = ({
  refresh, backPath, reportType, reportKey, intl: { formatMessage },
}: ReportHeaderButtonsProps) => {
  const history = useHistory();
  const { search } = useLocation();

  const realBackPath = useMemo(() => (
    backPath || `/devops/charts/${reportType}${search}`
  ), [backPath, search, reportType]);

  const reportList = useMemo(() => (
    reportListMap[reportType] || developReportList
  ), [reportType]);

  const groupBtnItems = useMemo(() => (
    map(filter(reportList, (item) => item?.key !== reportKey), (reportItem) => (
      {
        // @ts-ignore
        name: reportItem?.title || formatMessage({ id: `report.${reportItem?.key}.head` }),
        handler: () => handleClick(reportItem?.link),
      }
    ))
  ), [reportList]);

  const handleRefresh = useCallback(() => {
    refresh && refresh();
  }, []);

  const handleBack = useCallback(() => {
    history.push(realBackPath);
  }, [realBackPath]);

  const handleClick = useCallback((link: string) => {
    if (link) {
      history.push(`${link}${search}`);
    }
  }, [search]);

  return (
    <HeaderButtons
      items={[{
        name: '切换报表',
        groupBtnItems,
        display: true,
      }, {
        icon: 'arrow_back',
        handler: handleBack,
        display: true,
      }, {
        icon: 'refresh',
        handler: handleRefresh,
        display: true,
      }]}
    />
  );
};

export default injectIntl(ReportsHeaderButtons);
