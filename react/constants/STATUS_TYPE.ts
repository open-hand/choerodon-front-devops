type StatusProps = 'success' | 'failed' | 'created' | 'deploying' | 'canceled';

const STATUS_TYPE: {
  [key in StatusProps]: {
    icon: string
    color: string
    name: string
  }
} = {
  success: { icon: 'check_circle', color: '#1fc2bb', name: '成功' },
  failed: { icon: 'cancel', color: '#f76776', name: '失败' },
  deploying: { icon: 'timelapse', color: '#4d90fe', name: '部署中' },
  created: { icon: 'remove_circle', color: 'rgba(15, 19, 88, 0.25)', name: '未执行' },
  canceled: { icon: 'cancle_b', color: 'rgba(15, 19, 88, 0.25)', name: '已停止' },
};
export default STATUS_TYPE;
