'use client'
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useMenu } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export const Toolbar = ({ children }) => {
  return (
    <div className="flex items-center justify-between grow gap-2.5 pb-5">
      {children}
    </div>
  );
};

export const ToolbarHeading = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col flex-wrap gap-px', className)}>
      {children}
    </div>
  );
};

export const ToolbarTitle = ({ className, children }) => {
  return (
    <h1 className={cn('font-semibold text-foreground text-lg', className)}>
      {children}
    </h1>
  );
};

export const ToolbarActions = ({ children }) => {
  return (
    <div className="flex items-center flex-wrap gap-1.5 lg:gap-3.5">
      {children}
    </div>
  );
};

export const ToolbarDescription = ({ children }) => {
  return (
    <div className="flex items-center gap-2 text-sm font-normal text-secondary-foreground">
      {children}
    </div>
  );
};

export const ToolbarPageTitle = ({ text }) => {
  const pathname = usePathname();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  return (
    <h1 className="text-xl font-medium leading-none text-mono">
      {text ?? item?.title}
    </h1>
  );
};