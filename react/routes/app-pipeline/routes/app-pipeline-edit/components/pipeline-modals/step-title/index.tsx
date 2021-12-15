import React from 'react';

import './index.less';
import { Button } from 'choerodon-ui/pro';

const prefix = 'c7ncd-stepTitle';

interface buttonsProps {
    text: string,
    icon: string,
}

const Index = (props: {
    title: string,
    buttons?: buttonsProps[]
}) => {
  const {
    title,
    buttons,
  } = props;

  const renderButtons = (
    buttonList: buttonsProps[] | undefined,
  ) => buttonList && buttonList.map((item) => {
    const {
      text,
      icon,
    } = item;
    return (
      <Button>
        {text}
      </Button>
    );
  });

  return (
    <div className={prefix}>
      <p className={`${prefix}__title`}>{ title }</p>
      {
            renderButtons(buttons)
        }
    </div>
  );
};

Index.defaultProps = {
  buttons: [],
};

export default Index;
