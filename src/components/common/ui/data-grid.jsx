'use client';

import { createContext, useContext } from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Skeleton } from './skeleton';

const DataGridContext = createContext(undefined);

function useDataGrid() {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context;
}

function DataGridProvider({ children, table, ...props }) {
  return (
    <DataGridContext.Provider
      value={{
        props,
        table,
        recordCount: props.recordCount,
        isLoading: props.isLoading || false,
      }}
    >
      {children}
    </DataGridContext.Provider>
  );
}

function DataGrid({ children, table, ...props }) {
  const defaultProps = {
    loadingMode: 'skeleton',
    tableLayout: {
      dense: false,
      cellBorder: false,
      rowBorder: true,
      rowRounded: false,
      stripped: false,
      headerSticky: false,
      headerBackground: true,
      headerBorder: true,
      width: 'fixed',
      columnsVisibility: false,
      columnsResizable: false,
      columnsPinnable: false,
      columnsMovable: false,
      columnsDraggable: false,
      rowsDraggable: false,
    },
    tableClassNames: {
      base: '',
      header: '',
      headerRow: '',
      headerSticky: 'sticky top-0 z-10 bg-background/90 backdrop-blur-xs',
      body: '',
      bodyRow: '',
      footer: '',
      edgeCell: '',
    },
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
    tableLayout: {
      ...defaultProps.tableLayout,
      ...(props.tableLayout || {}),
    },
    tableClassNames: {
      ...defaultProps.tableClassNames,
      ...(props.tableClassNames || {}),
    },
  };

  // Ensure table is provided
  if (!table) {
    throw new Error('DataGrid requires a "table" prop');
  }

  return (
    <DataGridProvider table={table} {...mergedProps}>
      {children}
    </DataGridProvider>
  );
}

function DataGridContainer({ children, className, border = true }) {
  return (
    <div
      data-slot="data-grid"
      className={cn(
        'grid w-full',
        border && 'border border-border rounded-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

function DataGridEmpty({
  icon,
  title = 'No data available',
  description,
  action,
  className,
}) {
  return (
    <div
      data-slot="data-grid-empty"
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 px-4 text-center',
        className,
      )}
    >
      <div className="text-muted-foreground/60" aria-hidden="true">
        {icon || <Inbox className="size-8" />}
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
      {description && (
        <span className="text-sm text-muted-foreground max-w-sm">
          {description}
        </span>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function DataGridError({
  icon,
  title = 'Something went wrong',
  description = 'Failed to load data. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  action,
  className,
}) {
  return (
    <div
      data-slot="data-grid-error"
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 px-4 text-center',
        className,
      )}
    >
      <div className="text-destructive" aria-hidden="true">
        {icon || <AlertTriangle className="size-8" />}
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
      {description && (
        <span className="text-sm text-muted-foreground max-w-sm">
          {description}
        </span>
      )}
      {action ? (
        <div className="mt-2">{action}</div>
      ) : onRetry ? (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DataGridSkeletonRow({ columns = 1, className }) {
  return (
    <div
      data-slot="data-grid-skeleton-row"
      className={cn('flex items-center gap-4 py-3 px-4', className)}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
  );
}

function DataGridSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div
      data-slot="data-grid-skeleton"
      className={cn('flex flex-col divide-y divide-border', className)}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <DataGridSkeletonRow key={index} columns={columns} />
      ))}
    </div>
  );
}

export {
  useDataGrid,
  DataGridProvider,
  DataGrid,
  DataGridContainer,
  DataGridEmpty,
  DataGridError,
  DataGridSkeletonRow,
  DataGridSkeleton,
};
