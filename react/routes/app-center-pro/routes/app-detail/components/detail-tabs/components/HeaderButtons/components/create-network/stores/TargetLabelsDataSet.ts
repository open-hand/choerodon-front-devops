/* eslint-disable */

export default ({ formatMessage, keyOptionsDs }:any):any => {
  /**
   * 关键字检查
   * @param rule
   * @param value
   * @param callback
   */
  function checkKeywords(value: string, name: any, record: { dataSet: any[]; id: any; }) {
    // 必须由字母数字字符，' - '，'_'或'.'组成，并且必须以字母数字开头和结尾
    // 并且包括可选的DNS子域前缀(包括一级、二级域名)和'/'（例如'example.com/MyName'）
    const p = /^((?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\/)*([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;
    const isRepeat = record.dataSet.findIndex((r: { id: any; get: (arg0: any) => any; }) => record.id !== r.id && r.get(name) === value) !== -1;
    if (value) {
      if (p.test(value)) {
        if (isRepeat) {
          return formatMessage({ id: 'network.label.check.repeat' });
        }
      } else {
        return formatMessage({ id: 'network.label.check.failed' });
      }
    }
  }

  function checkValue(value: string, name: any, record: any) {
    const p = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
    if (value) {
      if (!p.test(value)) {
        return formatMessage({ id: 'network.label.check.failed' });
      }
    }
  }

  const dynamicProps = {
    required: ({ dataSet, record, name }:any) => {
      if (!dataSet.parent.current) return false;
      return dataSet.parent.current.get('target') === 'param';
    },
  };


  return {
    fields: [
      {
        name: 'keyword',
        type: 'string',
        label: formatMessage({ id: 'network.config.keyword' }),
        options: keyOptionsDs,
        validator: checkKeywords,
        textField: 'key',
        valueField: 'meaning',
        dynamicProps,
      },
      {
        name: 'value',
        type: 'string',
        label: formatMessage({ id: 'network.config.value' }),
        options: keyOptionsDs,
        validator: checkValue,
        textField: 'value',
        valueField: 'meaning',
        dynamicProps,
      },
    ],
    events: {
      update: updateEventHandler,
    },
  };
};

function updateEventHandler({ dataSet, record, name, value, oldValue }:any) {
  if (value && value.includes(':')) {
    const splitkv = value.split(':');
    record.set('keyword', splitkv[0]);
    record.set('value', splitkv[1]);
  }
  // 当keyword的值发生变化的时候 对其余记录做校验
  if (name === 'keyword') {
    checkOtherRecords(record, name);
  }
}


function checkOtherRecords(record: { dataSet: any[]; id: any; }, type: any) {
  record.dataSet.forEach((r: { id: any; get: (arg0: any) => any; getField: (arg0: any) => { (): any; new(): any; checkValidity: { (): void; new(): any; }; }; }) => {
    if (r.id !== record.id) {
      // 此处只对重复性做校验，不对空值做校验
      if (r.get(type)) {
        r.getField(type).checkValidity();
      }
    }
  });
}
