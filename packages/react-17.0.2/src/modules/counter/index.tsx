import { useEffect, useState } from "react";
import style from './index.module.css'
import reactImg from './react.png'

export const Counter = ({ start }: { start?: number }) => {
  const [num, setNum] = useState(start || 0)


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNum(prevNum => prevNum + 1)
    }, 1000);
    return () => clearInterval(intervalId);
  }, [])


  return <div className={style['counter-wrapper']}>
    React Counter: <div className={style['counter-number']}>{num}</div>
    <img style={{ width: '50px' }} src={reactImg} alt="react" />
  </div>;
}