import React from 'react';
import { Button, Dropdown } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { ButtonProps } from '@/interface';

import './index.less';

const prefix = 'c7ncd-stepTitle';

interface buttonsProps extends ButtonProps{
    text?: string,
    icon?: string,
    custom?: boolean,
    dom?: any,
}

const Index = (props: {
    title: string,
    buttons?: buttonsProps[]
    className?: any,
}) => {
  const {
    title,
    buttons,
    className,
  } = props;

  const renderButtons = (
    buttonList: buttonsProps[] | undefined,
  ) => buttonList && buttonList.map((item) => {
    const {
      text,
      icon,
      custom,
      dom,
      ...rest
    } = item;
    return custom ? dom : (
      <Button
        icon={icon}
        {...rest}
      >
        {text}
      </Button>
    );
  });

  return (
    <div className={classnames({
      [prefix]: true,
      [className]: Boolean(className),
    })}
    >
      <p className={`${prefix}__title`}>{ title }</p>
      <div>
        {
          renderButtons(buttons)
        }
      </div>
    </div>
  );
};

Index.defaultProps = {
  buttons: [],
  className: undefined,
};

export default Index;
