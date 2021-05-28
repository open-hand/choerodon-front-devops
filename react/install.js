import { set } from '@choerodon/inject';

set('devops:reportHeaderButtons', () => import('./routes/reports/Component/HeaderButtons'));
