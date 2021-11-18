import React, { useState, useMemo, useEffect } from 'react';
import _ from 'lodash';
import { Button, TextField, Modal } from 'choerodon-ui/pro';
import { cicdPipelineApi } from '@choerodon/master';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useDebounceFn } from 'ahooks';
import { Icon, message } from 'choerodon-ui';
import { YamlEditor } from '@choerodon/components';
import { FuncType } from '@/interface';

import './index.less';

const cssPrefix = 'c7ncd-customFunc';

const Index = observer(({
  useStore,
  modal,
}: {
  useStore: any
  modal?: any,
}) => {
  const [funcList, setFuncList] = useState<{
    edit: boolean,
    name: string,
    script: string,
    focus?: boolean,
  }[]>(JSON.parse(JSON.stringify(useStore.getFuncList)));

  const handleOk = () => {
    let flag = '';
    const funcName: string[] = [];
    for (let i = 0; i < funcList.length; i += 1) {
      const item = funcList[i];
      if (funcName.includes(item.name)) {
        flag = '函数集合名称不能重复';
        break;
      } else {
        funcName.push(item.name);
      }
    }
    if (flag) {
      message.error(flag);
      return false;
    }
    useStore.setFuncList(funcList);
    return true;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

  const { run } = useDebounceFn((v) => {
    const index = funcList.findIndex((item: any) => item.focus);
    setFuncList(funcList.map((item: any, iIndex: number) => ({
      ...item,
      script: iIndex === index ? v : item.script,
    })));
  }, {
    wait: 500,
  });

  const handleAddFunc = () => {
    setFuncList([
      ...funcList,
      {
        edit: true,
        name: '',
        script: '',
      },
    ]);
  };

  const handleChangeText = (v: string, index: number) => {
    if (v) {
      funcList[index] = {
        ...funcList[index],
        name: v,
        edit: false,
      };
    } else {
      funcList.splice(index, 1);
    }
    setFuncList(_.clone(funcList));
  };

  const handleEditItem = (index: number) => {
    funcList[index] = {
      ...funcList[index],
      edit: true,
    };
    setFuncList(_.clone(funcList));
  };

  const handleFocusItem = (index: number) => {
    setFuncList(funcList.map((item: any, iIndex: number) => ({
      ...item,
      focus: iIndex === index,
    })));
  };

  const handleDeleteItem = (index: number) => {
    Modal.confirm({
      title: '删除函数集合',
      children: `确定删除函数集合${funcList[index].name}吗`,
      okText: '删除',
      onOk: () => {
        funcList.splice(index, 1);
        setFuncList(funcList);
      },
    });
  };

  const renderFuncList = useMemo(() => funcList.map((item: any, index: number) => (
    <div
      role="none"
      className={classNames({
        [`${cssPrefix}__side__item`]: true,
        [`${cssPrefix}__side__item--focus`]: item.focus,
        // `${cssPrefix}__side__item`: true,
        // `${cssPrefix}__side__item--focus`: item.focus,
      })}
      onClick={() => handleFocusItem(index)}
    >
      {
        item.edit ? (
          <TextField
            autoFocus
            className={`${cssPrefix}__side__item__left`}
            value={item.name}
            maxLength={60}
            onChange={(v: string) => console.log(v)}
            onBlur={(e) => handleChangeText(e.target.value, index)}
          />
        ) : (
          <p className={`${cssPrefix}__side__item__left`}>{ item.name }</p>
        )
      }
      <div className={`${cssPrefix}__side__item__buttons`}>
        {
          item.devopsPipelineId === 0 ? (
            <div className={`${cssPrefix}__side__item__buttons__preset`}>
              预置
            </div>
          ) : (
            <>
              {
                !item.edit && (
                  <Icon
                    className={`${cssPrefix}__side__item__buttons__icon`}
                    type="edit-o"
                    onClick={() => handleEditItem(index)}
                  />
                )
              }
              <Icon
                className={`${cssPrefix}__side__item__buttons__icon`}
                type="delete_black-o"
                onClick={() => handleDeleteItem(index)}
              />
            </>
          )
        }

      </div>
    </div>
  )), [funcList]);

  return (
    <div className={cssPrefix}>
      <div className={`${cssPrefix}__side`}>
        { renderFuncList }
        <Button
          className={`${cssPrefix}__side__add`}
          funcType={'flat' as FuncType}
          icon="add"
          onClick={handleAddFunc}
        >
          添加函数集合
        </Button>
      </div>
      <div className={`${cssPrefix}__content`}>
        {funcList.some((item: any) => item.focus) && (
          <YamlEditor
            value={funcList.find((item: any) => item.focus)?.script || ''}
            readOnly={false}
            modeChange={false}
            onValueChange={(v: string) => run(v)}
          />
        )}
      </div>
    </div>
  );
});

export default Index;
