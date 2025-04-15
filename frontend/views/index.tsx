import { Counter } from './_components/Counter';

export interface PageProps {
  name: string;
}

export default function Page({ name }: PageProps) {
  return (
    <div>
      <h1>{name}</h1>
      <Counter />
    </div>
  );
}
