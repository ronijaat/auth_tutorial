import NavBar from './_components/NavBar';

interface layoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: layoutProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-sky-500">
      <div className="m-4">
        <NavBar />
      </div>
      {children}
    </div>
  );
};

export default layout;
