// pro btn 的颜色和类型的枚举
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
// Form label labellayout的枚举类型
import { LabelLayoutType, LabelAlignType } from 'choerodon-ui/pro/lib/form/Form';
// 大小枚举
import { Size } from 'choerodon-ui/lib/_util/enum';
// DataSet record
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  DataSetSelection, FieldType, FieldIgnore, DataSetStatus,
} from 'choerodon-ui/pro/lib/data-set/enum';
import {
  TableQueryBarType, SelectionMode, TableColumnTooltip, TableMode,
} from 'choerodon-ui/pro/lib/table/enum';
import DataSet from 'choerodon-ui/pro/lib/data-set';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

import { UploadFile } from 'choerodon-ui/pro/lib/upload/interface';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';

interface UserDTOProps {
  realName: string,
  loginName: string,
  email: string,
  ldap: boolean,
  imageUrl: string,
}

interface RecordObjectProps {
  record: Record;
}

interface UpdateEventProps {
  dataSet: DataSet,
  record: Record,
  name: string,
  value: any,
  oldValue: any,
}

export {
  TableMode,
  ButtonColor,
  FuncType,
  LabelLayoutType,
  LabelAlignType,
  Size,
  Record,
  DataSetProps,
  DataSetSelection,
  FieldType,
  FieldIgnore,
  TableQueryBarType,
  SelectionMode,
  DataSet,
  UserDTOProps,
  TableColumnTooltip,
  RecordObjectProps,
  ShowHelp,
  UploadFile,
  ResizeType,
  Placements,
  UpdateEventProps,
  DataSetStatus,
  FieldProps,
};
