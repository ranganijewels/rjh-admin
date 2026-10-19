import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Status-to-variant mapping. Covers the storefront/admin order lifecycle so
// every status pill comes from one place instead of ad-hoc per-page colors.
const statusToVariant = {
  active: 'success',
  inactive: 'secondary',
  enabled: 'success',
  disabled: 'secondary',
  success: 'success',
  completed: 'success',
  complete: 'success',
  delivered: 'success',
  shipped: 'success',
  fulfilled: 'success',
  paid: 'success',
  processing: 'warning',
  'in production': 'warning',
  picking: 'warning',
  packing: 'warning',
  pending: 'warning',
  'partially fulfilled': 'warning',
  'partially shipped': 'warning',
  unfulfilled: 'warning',
  unpaid: 'warning',
  draft: 'secondary',
  published: 'success',
  finished: 'success',
  warning: 'warning',
  info: 'info',
  confirmed: 'info',
  'order placed': 'warning',
  authorized: 'info',
  new: 'info',
  returned: 'destructive',
  refunded: 'destructive',
  cancelled: 'destructive',
  canceled: 'destructive',
  failed: 'destructive',
  error: 'destructive',
  voided: 'destructive',
  // Support tickets
  open: 'info',
  'in progress': 'warning',
  'in-progress': 'warning',
  resolved: 'success',
  closed: 'secondary',
  escalated: 'destructive',
};

const badgeVariants = cva(
  'inline-flex items-center justify-center border font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        info: 'bg-info text-info-foreground',
        mono: 'bg-mono text-mono-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      appearance: {
        solid: 'border-transparent',
        outline: '',
        light: '',
        stroke: 'bg-transparent border border-border text-secondary-foreground',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
      },
      size: {
        lg: 'rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5',
        md: 'rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5 ',
        sm: 'rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3',
        xs: 'rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      { variant: 'primary', appearance: 'outline', className: 'bg-primary/5 border-primary/10 text-primary' },
      { variant: 'secondary', appearance: 'outline', className: 'bg-secondary dark:bg-secondary/50 border-border text-secondary-foreground' },
      { variant: 'success', appearance: 'outline', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900' },
      { variant: 'warning', appearance: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900' },
      { variant: 'info', appearance: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900' },
      { variant: 'mono', appearance: 'outline', className: 'bg-mono/5 border-mono/10 text-mono' },
      { variant: 'destructive', appearance: 'outline', className: 'bg-red-50 text-red-700 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900' },

      { variant: 'primary', appearance: 'light', className: 'bg-primary/5 text-primary' },
      { variant: 'secondary', appearance: 'light', className: 'bg-secondary dark:bg-secondary/50 text-secondary-foreground' },
      { variant: 'success', appearance: 'light', className: 'bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/40' },
      { variant: 'warning', appearance: 'light', className: 'bg-amber-50 text-amber-700 dark:text-amber-400 dark:bg-amber-950/40' },
      { variant: 'info', appearance: 'light', className: 'bg-blue-50 text-blue-700 dark:text-blue-400 dark:bg-blue-950/40' },
      { variant: 'mono', appearance: 'light', className: 'bg-mono/5 text-mono' },
      { variant: 'destructive', appearance: 'light', className: 'bg-red-50 text-red-700 dark:text-red-400 dark:bg-red-950/40' },

      { variant: 'primary', appearance: 'ghost', className: 'text-primary' },
      { variant: 'secondary', appearance: 'ghost', className: 'text-secondary-foreground' },
      { variant: 'success', appearance: 'ghost', className: 'text-emerald-600' },
      { variant: 'warning', appearance: 'ghost', className: 'text-amber-600' },
      { variant: 'info', appearance: 'ghost', className: 'text-blue-600' },
      { variant: 'mono', appearance: 'ghost', className: 'text-mono' },
      { variant: 'destructive', appearance: 'ghost', className: 'text-destructive' },

      { size: 'lg', appearance: 'ghost', className: 'px-0' },
      { size: 'md', appearance: 'ghost', className: 'px-0' },
      { size: 'sm', appearance: 'ghost', className: 'px-0' },
      { size: 'xs', appearance: 'ghost', className: 'px-0' },
    ],
    defaultVariants: {
      variant: 'secondary',
      appearance: 'solid',
      size: 'md',
    },
  },
);

const badgeButtonVariants = cva(
  'cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5 p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  asChild = false,
  disabled,
  ...props
}) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, appearance, shape, disabled }),
        className,
      )}
      {...props}
    />
  );
}

function BadgeButton({ className, variant, onClick, onKeyDown, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'span';
  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event);
    }
  };
  return (
    <Comp
      data-slot="badge-button"
      className={cn(badgeButtonVariants({ variant, className }))}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

function BadgeDot({ className, ...props }) {
  return (
    <span
      data-slot="badge-dot"
      className={cn(
        'size-1.5 rounded-full bg-[currentColor] opacity-75',
        className,
      )}
      {...props}
    />
  );
}

// New reusable badge for status values
function StatusBadge({
  status,
  appearance = 'outline',
  size = 'md',
  shape = 'circle',
  className,
  ...props
}) {
  const variant = statusToVariant[String(status || '').toLowerCase()] || 'secondary';

  return (
    <Badge
      variant={variant}
      appearance={appearance}
      size={size}
      shape={shape}
      className={className}
      {...props}
    >
      {status}
    </Badge>
  );
}

export { Badge, BadgeButton, BadgeDot, badgeVariants, StatusBadge };
