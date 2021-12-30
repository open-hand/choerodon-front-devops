import React, { useEffect, useState, useRef } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';

import './index.less';

const prefix = 'c7ncd-sideStep';

// eslint-disable-next-line no-shadow
enum typeProps {
  scrollTop= 'scrollTop',
}

let listen: any;

const Index = observer(({
  data,
  scrollContext,
}: {
  scrollContext: string,
  data: {
    text: string,
    el: any
    focus?: any,
    type?: typeProps,
    display: boolean,
  }[],
}) => {
  const [list, setList] = useState<any>([]);

  const ref = useRef<any>([]);

  useEffect(() => {
    ref.current = list;
  }, [list]);

  useEffect(() => {
    const focusIndex = list?.findIndex((i: any) => i.focus);
    const newList = data.map((item, index) => {
      const newItem = item;
      newItem.focus = (focusIndex !== -1 ? index === focusIndex : index === 0);
      return newItem;
    });
    setList(newList);
    handleAddEventListener();
    return () => {
      document.querySelector(scrollContext)?.removeEventListener('scroll', listen);
    };
  }, [data]);

  const scrollListener = () => {
    const scrollDom = document.querySelector(scrollContext);
    const scrollTop = scrollDom?.scrollTop || 0;
    ref.current.forEach((item: any, index: number) => {
      const offsetTop = document.querySelector(item.el)?.offsetTop;
      if (offsetTop - scrollTop <= 89 && offsetTop - scrollTop > 0) {
        if (!ref.current[index].focus) {
          handleClickItem(item, false);
        }
      }
    });
  };

  const handleAddEventListener = () => {
    listen = document.querySelector(scrollContext)?.addEventListener('scroll', scrollListener);
  };

  const handleClickItem = (item: any, needScroll = true) => {
    if (needScroll) {
      if (item.type) {
        switch (item.type) {
          case 'scrollTop': {
            document.querySelector(item.el).scrollTo({
              top: 0,
            });
            break;
          }
          default: {
            break;
          }
        }
      } else {
        document.querySelector(item.el)?.scrollIntoView({
          block: 'start',
        });
      }
    }
    const newList = ref.current.map((d: any, index: number) => {
      const newItem = d;
      newItem.focus = (item.text === d.text);
      return newItem;
    });
    setList(newList);
  };

  return (
    <div className={prefix}>
      {
        list.filter((item: any) => item.display).map((item: any) => (
          <div
            role="none"
            className={classnames({
              [`${prefix}__item`]: true,
              [`${prefix}__item--focus`]: item.focus,
            })}
            onClick={() => handleClickItem(item)}
          >
            <p className={`${prefix}__item__line`} />
            <p className={`${prefix}__item__text`}>{item.text}</p>
          </div>
        ))
      }
    </div>
  );
});

export default Index;

export { typeProps };
