import { Pagination } from 'choerodon-ui/pro';
import { PaginationProps } from 'choerodon-ui/pro/lib/pagination/Pagination';
import React, { FC } from 'react';

import './index.less';

const CardPagination:FC<PaginationProps> = (props) => {
  const {
    className,
  } = props;
  return (
    <Pagination
      {...props}
      className={`c7ncd-cardPagition ${className}`}
      showQuickJumper={false}
      hideOnSinglePage={false}
      showSizeChanger={false}
      showSizeChangerLabel={false}
      showTotal={false}
    />
  );
};

export default CardPagination;
