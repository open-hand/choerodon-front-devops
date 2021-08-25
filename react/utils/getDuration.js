import moment from 'moment';

export default function getDuration({ value, unit = 's' }) {
  const duration = moment.duration(value, unit);
  const seconds = duration.seconds();
  const minutes = duration.minutes();
  const hours = duration.hours();
  const days = duration.days();
  return `${days ? `${days}天` : ''}${hours ? `${hours}小时` : ''}${minutes ? `${minutes}分钟` : ''}${seconds ? `${seconds}秒` : ''}`;
}

export const getConsumeDuration = (beginDate, endDate) => {
  if (beginDate && endDate) {
    const beginTime = moment(beginDate);
    const endTime = moment(endDate);
    const duration = moment.duration(endTime - beginTime, 'ms');
    const hours = duration.get('hours');
    const minutes = duration.get('minutes');
    const seconds = duration.get('seconds');
    return `${hours ? `${hours}小时` : ''}${minutes ? `${minutes}分钟` : ''}${seconds ? `${seconds}秒` : ''}`;
  }
  return '';
};
