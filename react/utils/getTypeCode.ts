export const getTypeCode = (typeCode:string) => {
  let mes = '';
  let icon = '';
  let color = '';
  switch (typeCode) {
    case 'story':
      mes = '故事';
      icon = 'agile_story';
      color = '#00bfa5';
      break;
    case 'bug':
      mes = '缺陷';
      icon = 'agile_fault';
      color = '#f44336';
      break;
    case 'issue_epic':
      mes = '史诗';
      icon = 'agile_epic';
      color = '#743be7';
      break;
    case 'sub_task':
      mes = '子任务';
      icon = 'agile_subtask';
      color = '#4d90fe';
      break;
    case 'activity':
      mes = '活动';
      icon = 'agile_activity';
      color = '#4D90FE';
      break;
    case 'milestone':
      mes = '里程碑';
      icon = 'agile_milestone';
      color = '#6ED9C3';
      break;
    case 'stage':
      mes = '阶段';
      icon = 'agile_view_timeline';
      color = '#FBBC57';
      break;
    default:
      mes = '任务';
      icon = 'agile_task';
      color = '#4d90fe';
  }
  return { mes, icon, color };
};
