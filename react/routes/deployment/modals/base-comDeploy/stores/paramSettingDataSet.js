const mapping = {
  params: {
    name: 'params',
    type: 'string',
    label: '参数',
  },
  defaultParams: {
    name: 'defaultParams',
    type: 'string',
    label: '参数默认值',
  },
  paramsScope: {
    name: 'paramScope',
    type: 'string',
    label: '参数范围',
  },
  paramsRunnigValue: {
    name: 'paramsRunningValue',
    type: 'string',
    label: '参数运行值',
  },
  tooltip: {
    name: 'tooltip',
    type: 'string',
  },
};

export { mapping };

function setData() {
  const data = [
    ['appendfsync', 'everysec', 'no,always,everysec', '操作系统的fsync函数刷新缓冲区数据到磁盘，有些操作系统会真正刷新磁盘上的数据，其他一些操作系统只会尝试尽快完成。\n'
    + 'Redis支持三种不同的调用 fsync的方式：\n'
    + 'no：不调用fsync,由操作系统决定何时刷新数据到磁盘，性能最高。\n'
    + 'always：每次写AOF文件都调用fsync，性能最差，但数据最安全。\n'
    + 'everysec：每秒调用一次fsync。兼具数据安全和性能。\n'],
    ['appendonly', 'yes', 'yes,no', '指定是否在每次更新操作后进行日志记录，Redis在默认情况下是异步的把数据写入磁盘，如果不开启，可能会在断电时导致一段时间内的数据丢失。有2个取值供选择：\n'
    + 'yes：开启。\n'
    + 'no：关闭。\n'],
    // ['client-output-buffer-limit-slave-soft-seconds', '60', '0～60', 'slave客户端output-buffer超过
    // client-output-buffer-slave-soft-limit设置的大小，并且持续时间超过此值（单位为秒），服务端会主动断开连接。'],
    // ['client-output-buffer-slave-hard-limit', '429,496,729', '0～4,294,967,296', '对slave客户端ou
    // tput-buffer的硬限制（单位为字节），如果slave客户端output-buffer大于此值，服务端会主动断开连接。'],
    // ['client-output-buffer-slave-soft-limit', '429,496,729', '0～4,294,967,296', '对slave客户端output
    // -buffer的软限制（单位为字节），如果output-buffer大于此值并且持续时间超过client-output-buffe
    // r-limit-slave-soft-seconds设置的时长，服务端会主动断开连接。'],
    ['hash-max-ziplist-entries', '512', '1～10,000', '当hash表中只有少量记录时，使用有利于节约内存的的数据结构来对hashes进行编码。'],
    ['hash-max-ziplist-value', '64', '1～10,000', '当hash表中最大的取值不超过预设阈值时，使用有利于节约内存的的数据结构来对hashes进行编码。'],
    ['latency-monitor-threshold', '0', '0～86,400,000', '延时监控的采样时间阀值（最小值），单位为毫秒。\n'
    + '阀值设置为0：不做监控，也不采样；\n'
    + '阀值设置为大于0：，将记录执行耗时大于阀值的操作。\n'
    + '可以通过LATENCY等命令获取统计数据和配置、执行采样监控。\n'],
    ['lua-time-limit', '5,000', '100～5,000', 'Lua脚本的最长执行时间，单位为毫秒。'],
    // ['master-read-only', 'no', 'yes,no', '设置实例为只读状态。设置只读后，所有写入命令将返回失败。'],
    ['maxclients', '10,000', '1,000～50,000', '最大同时连接的客户端个数。'],
    ['maxmemory-policy', 'volatile-lru', 'volatile-lru,allkeys-lru,volatile-lfu,allkeys-lfu,volatile-random,allkeys-random,volatile-ttl,noeviction', '在达到内存上限（maxmemory）时DCS将如何选择要删除的内容。有8个取值供选择：\n'
    + 'volatile-lru：根据LRU算法删除设置了过期时间的键值。\n'
    + 'allkeys-lru：根据LRU算法删除任一键值。\n'
    + 'volatile-random：删除设置了过期时间的随机键值。\n'
    + 'allkeys-random：删除一个随机键值。\n'
    + 'volatile-ttl：删除即将过期的键值，即TTL值最小的键值。\n'
    + 'noeviction：不删除任何键值，只是返回一个写错误。\n'
    + 'volatile-lfu: 根据LFU算法删除设置了过期时间的键值。\n'
    + 'allkeys-lfu: 根据LFU算法删除任一键值。\n'],
    ['notify-keyspace-events', 'Ex', '请参考该参数的描述。', 'notify-keyspace-events选项的参数为空字符串时，功能关闭。另一方面，当参数不是空字符串时，功能开启。notify-keyspace-events的参数可以是以下字符的任意组合，它指定了服务器该发送哪些类型的通知：\n'
    + 'K：键空间通知，所有通知以__keyspace@__为前缀。\n'
    + 'E：键事件通知，所有通知以__keyevent@__为前缀。\n'
    + 'g：DEL、EXPIRE、RENAME等类型无关的通用命令的通知。\n'
    + '$：字符串命令的通知。\n'
    + 'l：列表命令的通知。\n'
    + 's：集合命令的通知。\n'
    + 'h：哈希命令的通知。\n'
    + 'z：有序集合命令的通知。\n'
    + 'x：过期事件：每当有过期键被删除时发送。\n'
    + 'e：驱逐(evict)事件：每当有键因为maxmemory政策而被删除时发送。\n'
    + 'A：参数g$lshzxe的别名。\n'
    + '输入的参数中至少有一个K或者E，A不能与g$lshzxe同时出现，不能出现相同字母。举个例子，如果只想订阅键空间中和列表相关的通知，那么参数就应该设为Kl。将参数设为字符串"AKE"表示发送所有类型的通知。\n'],
    ['proto-max-bulk-len', '536,870,912', '1,048,576～536,870,912', 'Redis协议中的最大的请求大小，单位为字节。'],
    ['repl-backlog-size', '1,048,576', '16,384～1,073,741,824', '用于增量同步的复制积压缓冲区大小（单位为字节）。这是一个用来在从节点断开连接时，存放从节点数据的缓冲区，当从节点重新连接时，如果丢失的数据少于缓冲区的大小，可以用缓冲区中的数据开始增量同步。'],
    ['repl-backlog-ttl', '3,600', '0～604,800', '从节点断开后，主节点释放复制积压缓冲区内存的秒数。值为0时表示永不释放复制积压缓冲区内存。'],
    ['repl-timeout', '60', '30～3,600', '主从同步超时时间，单位为秒。'],
    ['set-max-intset-entries', '512', '1～10,000', '当一个集合仅包含字符串且字符串为在64位有符号整数范围内的十进制整数时，使用有利于节约内存的的数据结构对集合进行编码。'],
    ['slowlog-log-slower-than', '10,000', '0～1,000,000', 'Redis慢日志会记录超过指定执行时间的命令。\n'
    + 'slowlog-log-slower-than用于配置记录到慢日志的命令执行时间阈值，单位为微秒。\n'],
    ['slowlog-max-len', '128', '0～1,000', '慢日志记录的条数。注意慢日志记录会消耗额外的内存。可以通过执行SLOWLOG RESET命令清除慢日志记录。'],
    ['timeout', '0', '0～7,200', '客户端空闲N秒（timeout参数的取值）后将关闭连接。当N=0时，表示禁用该功能。'],
    ['zset-max-ziplist-entries', '128', '1～10,000', '当有序集合中只有少量记录时，使用有利于节约内存的的数据结构对有序序列进行编码。'],
    ['zset-max-ziplist-value', '64', '1～10,000', '当有序集合中的最大取值不超过预设阈值时，使用有利于节约内存的的数据结构对有序集合进行编码。'],
  ];
  return data.map((item) => ({
    [mapping.params.name]: item[0],
    [mapping.defaultParams.name]: item[1],
    [mapping.paramsScope.name]: item[2],
    [mapping.tooltip.name]: item[3],
    [mapping.paramsRunnigValue.name]: item[1].replace(/,/gi, ''),
  }));
}

export default () => ({
  paging: false,
  selection: false,
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
  data: setData(),
});
