// 秒转换成时分秒

export const formateTime = (time:any) => {
  const second = time % 60;
  const totalMinute = (time - second) / 60;
  const minute = (time - second) / 60 % 60;
  const h = (totalMinute - minute) / 60;

  const hours = h < 10 ? `0${h}` : h;
  const formatSecond = second > 59 ? 59 : second;
  const renderMinute = (value:any) => {
    if (hours > 0) {
      return value < 10 ? `0${value}分` : `${value}分`;
    }
    if (value > 0) {
      return `${value}分`;
    }
    return '';
  };
  const renderSecond = (value:any) => {
    if (minute > 0) {
      return value < 10 ? `0${value}秒` : `${value}秒`;
    }
    if (value > 0) {
      return `${value}秒`;
    }
    return '';
  };

  return `${hours > 0 ? `${hours}分` : ''}${renderMinute(minute)}${renderSecond(formatSecond)}`;
};
