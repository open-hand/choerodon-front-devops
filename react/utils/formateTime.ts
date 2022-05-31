// 秒转换成时分秒

export const formateTime = (value:any) => {
  let theTime = value;// 秒
  let middle = 0;// 分
  let hour = 0;// 小时

  if (theTime >= 60) {
    middle = theTime / 60;
    theTime %= 60;
    if (middle >= 60) {
      hour = middle / 60;
      middle %= 60;
    }
  }
  let result = `${theTime}秒`;
  if (middle > 0) {
    result = `${middle}分${result}`;
  }
  if (hour > 0) {
    result = `${hour}小时${result}`;
  }
  return result;
};
