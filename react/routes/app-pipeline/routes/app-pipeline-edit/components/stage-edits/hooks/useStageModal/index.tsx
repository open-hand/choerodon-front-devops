import { useModal } from 'choerodon-ui/pro';
import { useFormatCommon, CONSTANTS } from '@choerodon/master';
import useFormatAppPipelineEdit from '../../../../hooks/useFormatAppPipelineEdit';

type StageModalTypes = 'create' | 'edit';

type StageModalOptions<R> = {
  onOk?:(data:R)=>void
  onCancel?:(data:R)=>void
  initialValue?: R
}

function useStageModal<T>(type:StageModalTypes = 'create', options?:StageModalOptions<T>):()=>void {
  const Modal = useModal();
  const formatPipelineEdit = useFormatAppPipelineEdit();
  const formatCommon = useFormatCommon();

  const handleModalOpen = () => {
    Modal.open({
      title: type === 'create' ? '添加阶段' : '编辑阶段',
      children: 'dsadas',
      style: {
        width: CONSTANTS.MODAL_WIDTH.MIN,
      },
      drawer: true,
    });
  };

  return handleModalOpen;
}

export default useStageModal;
