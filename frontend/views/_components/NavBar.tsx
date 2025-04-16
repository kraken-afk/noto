interface NavBarProps {
  name: string;
}

export function NavBar({ name }: NavBarProps) {
  return (
    <nav className="w-full border-b p-4 h-16 flex justify-between items-center">
      <span className="text-3xl font-serif ">Noto</span>
      <span className="badge badge-soft badge-primary">{name}</span>
    </nav>
  );
}
