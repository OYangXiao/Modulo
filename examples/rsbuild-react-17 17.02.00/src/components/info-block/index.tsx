import { useEffect } from 'react';
import styles from './index.module.css';
import jquery from 'jquery'

export const InfoBlock = ({ head_info }: { head_info: string }) => {
  useEffect(() => {
    console.log('react info-block component created');
    console.log(jquery.Deferred)
    return () => {
      console.log('react info-block component unmount');
    }
  }, [])


  return (
    <div className={styles.title}>
      资讯展示模块
      <h1 className={styles.head}>{head_info || 'default head info'}</h1>
      {['a', 'b', 'c'].map(el => <div key={el} className={styles.content}>{el}</div>)}
    </div>
  );
};
