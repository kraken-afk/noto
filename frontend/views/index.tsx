import { Counter } from './_components/Counter';
import './app.css';

export interface PageProps {
  name: string;
}

export default function Page({ name }: PageProps) {
  return (
    <div>
      <h1 className="text-red-500">{name}</h1>
      <p>Hello Romeo</p>
      <Counter />
    </div>
  );
}
