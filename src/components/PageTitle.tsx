import { FC, ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageTitle: FC<PageTitleProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
      </div>
      {children && <div className="flex space-x-3">{children}</div>}
    </div>
  );
};

export default PageTitle;