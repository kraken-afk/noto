import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((prev) => prev + 1)} type="button">
        add
      </button>
    </div>
  );
}
