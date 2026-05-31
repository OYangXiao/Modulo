import { Counter } from '@/modules/react-counter';
import './App.css';
import $ from 'jquery';
import { useLayoutEffect, useRef } from 'react';

const App = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    console.log(ref.current);
    $.ajax({
      url: 'https://api.github.com/users/oyx',
      success: (data) => {
        console.log(data);
      },
    });
  }, []);

  return (
    <div className="content" ref={ref}>
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <Counter />
    </div>
  );
};

export default App;
