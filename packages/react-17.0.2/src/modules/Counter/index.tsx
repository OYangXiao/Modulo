import { useEffect, useState } from "react";

export const Counter = ({ start }: { start?: number }) => {
  const [num, setNum] = useState(start || 0)


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNum(prevNum => prevNum + 1)
    }, 1000);
    return () => clearInterval(intervalId);
  }, [])


  return <div>Counter: {num}</div>;
}