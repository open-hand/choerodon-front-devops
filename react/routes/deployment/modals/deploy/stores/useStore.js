import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    imageYaml: '# docker run指令\n'
      + '# 不可删除${containerName}和${imageName}占位符\n'
      + '# 不可删除 -d: 后台运行容器\n'
      + '# 其余参数可参考可根据需要添加\n'
      + 'docker run --name=${containerName} -d ${imageName}',

    get getImageYaml() {
      return this.imageYaml;
    },

    setImageYaml(value) {
      this.imageYaml = value;
    },
    jarYaml: '# java -jar指令\n'
      + '# 不可删除${jar}\n'
      + '# java -jar 后台运行参数会自动添加 不需要在重复添加\n'
      + '# 其余参数可参考可根据需要添加\n'
      + 'java -jar ${jar}\n'
      + '# 默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log\n'
      + '# 填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log\n'
      + '# 请确保用户有该目录操作权限',

    get getJarYaml() {
      return this.jarYaml;
    },

    setJarYaml(value) {
      this.jarYaml = value;
    },
  }));
}
