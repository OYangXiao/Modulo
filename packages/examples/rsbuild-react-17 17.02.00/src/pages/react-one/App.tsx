import styles from './App.module.css';

import { InfoBlock } from '../../components/info-block';

const App = () => {
  return (
    <div className={styles.content}>
      <h1 className={styles['content-h1']}>Rsbuild with React</h1>
      <p className={styles['content-p']}>Start building amazing things with Rsbuild.</p>
      <InfoBlock head_info="123" />
    </div>
  );
};

export default App;
