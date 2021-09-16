const text1 = `helm repo add c7n https://openchart.choerodon.com.cn/choerodon/c7n/
helm repo update`;
const text2 = `helm install c7n/persistentvolumeclaim \\
--set accessModes={ReadWriteMany} \\
--set requests.storage=5Gi \\
--set storageClassName="nfs-provisioner" \\
--version 0.1.0 \\
--name runner-maven-pvc \\
--namespace c7n-system`;
const text3 = `helm install c7n/persistentvolumeclaim \\
--set accessModes={ReadWriteMany} \\
--set requests.storage=5Gi \\
--set storageClassName="nfs-provisioner" \\
--version 0.1.0 \\
--name runner-cache-pvc \\
--namespace c7n-system`;

export {
  text1,
  text2,
  text3,
};
