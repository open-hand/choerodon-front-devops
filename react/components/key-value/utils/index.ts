/* eslint-disable no-underscore-dangle */
import jsYaml from 'js-yaml';

/**
  *
  * @param value
  * @returns {boolean}
  * @private
  */
function _isObject(value:any) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
  * 判断对象是否为空
  * @param value
  * @returns {boolean}
  */
function _isEmpty(value:string) {
  return !Object.keys(value).length;
}

/**
  * 键值对模式下的一个 config 项
  * @param key
  * @param value
  * @param index 默认从1开始的数字，可以是字符串
  * @constructor
  */
function ConfigNode(key = null, value = null, index = 1) {
  if (!new.target) throw new Error('ConfigNode() must be called with new');

  this.temp = '=';
  this.key = key;
  this.value = value;
  this.index = index;
}

/**
  * 对象转 YAML
  * 使用 js-yaml 的 dump 方法
  * @param value
  */
function objToYaml(value:string) {
  if (!value) return '';

  const _value = takeObject(value);

  if (_isEmpty(_value)) return '';

  return jsYaml.dump(_value);
}

/**
  * YAML 转对象
  * 使用 js-yaml 的 load 方法
  * @param value
  */
function yamlToObj(value:string) {
  return jsYaml.load(value);
}

/**
  * 根据配置映射键值对生成的数据结构提取出映射
  * @param data
  */
function takeObject(data:any) {
  const _value:any = {};

  if (_isObject(data)) return data;

  if (!Array.isArray(data)) return _value;

  for (let i = 0, len = data.length; i < len; i += 1) {
    const { key, value } = data[i];
    if (key) {
      _value[key] = value || '';
    }
  }

  return _value;
}

/**
  * 由 YAML 数据 还原为键值对原始存储
  * @param data
  * @returns {*}
  */
function makePostData(data:any) {
  if (!data) {
    // @ts-expect-error
    const config = new ConfigNode();
    return [config];
  }

  const dataEntries = Object.entries(data);

  let index = 1;
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of dataEntries) {
    // @ts-expect-error
    const config = new ConfigNode(key, value, index);
    result.push(config);
    // eslint-disable-next-line no-plusplus
    index++;
  }

  return result;
}

export {
  objToYaml,
  yamlToObj,
  takeObject,
  makePostData,
  ConfigNode,
};
