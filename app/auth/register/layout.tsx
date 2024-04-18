import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-sky-500">
      {children}
    </div>
  );
};

export default Layout;
