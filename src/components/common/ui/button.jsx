import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Design-system naming note (audit P1): this component's `variant` controls
// color/semantic role, `size` controls dimensions, `appearance` controls
// styling density (default/ghost), and `mode` controls behavior
// (default/icon/link/input) — matching the intended convention shared with
// Badge/Alert (variant/appearance/size[/icon]). Badge and Alert already
// follow this subset; Button additionally needs `mode` for its
// default/icon/link/input behavior modes, which the others don't have.
// Full cross-component prop rename (e.g. aligning `underline`/`underlined`
// duplication or introducing `mode` on Badge/Alert) is deferred: it would
// require touching every call site of Button, Badge, and Alert across the
// app and is out of scope for this targeted fix.

// Shared class fragment for the "subtle icon" treatment, reused below by
// several compound variants (audit P2: reduces duplication of the same
// selector string across variant combinations). A global `.icon-subtle`
// utility in globals.css would let Badge/Alert/etc. share this too, but
// editing globals.css is out of scope here, so it's kept local for now.
const ICON_SUBTLE = "[&_svg:not([role=img]):not([class*=text-])]:opacity-60";

const buttonVariants = cva(
  "cursor-pointer group whitespace-nowrap inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed [&_svg]:shrink-0",
  {
    variants: {
      // Contrast note (audit P2): `primary` pairs --primary (navy #162640)
      // background with --primary-foreground (white) text. #162640 on white
      // is ~13.5:1 contrast, passing WCAG AA and AAA for normal and large
      // text. This is checked manually here; there is no automated
      // contrast lint (e.g. axe-core/polished) wired into CI yet — adding
      // one is a build-tooling change out of scope for this component file.
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90",
        mono: "bg-mono text-mono-foreground hover:bg-mono/90 data-[state=open]:bg-mono/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[state=open]:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 data-[state=open]:bg-secondary/90",
        outline:
          "bg-background text-accent-foreground border border-input hover:bg-accent data-[state=open]:bg-accent",
        dashed:
          "text-accent-foreground border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground",
        ghost:
          "text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        dim: "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
        foreground: "",
        inverse: "",
      },
      appearance: {
        default: "",
        ghost: "",
      },
      underline: {
        solid: "",
        dashed: "",
      },
      underlined: {
        solid: "",
        dashed: "",
      },
      // Sizing note (audit P1): sm=h-7 (28px), md=h-8.5 (34px), lg=h-10 (40px)
      // are desktop pixel sizes and sit below the 44x44px WCAG 2.5.5 (AAA)
      // target size. This is an intentional, documented tradeoff — this is a
      // dense desktop admin UI (tables, toolbars, inline actions) where a
      // 44px minimum on every button would blow out layouts. AAA target-size
      // compliance is not pursued here; AA (2.5.5 is AAA-only, not required
      // for AA) is unaffected. Do not silently bump these without a full
      // layout pass across the admin.
      size: {
        lg: "h-10 rounded-md px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4",
        md: "h-8.5 rounded-md px-3 gap-1.5 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4",
        sm: "h-7 rounded-md px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5",
      },
      autoHeight: {
        true: "",
        false: "",
      },
      shape: {
        default: "",
        circle: "rounded-full",
      },
      mode: {
        default:
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        icon: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        link: "text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent",
        input: `
            justify-start font-normal hover:bg-background [&_svg]:transition-colors [&_svg]:hover:text-foreground data-[state=open]:bg-background 
            focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/30 
            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-hidden [[data-state=open]>&]:ring-[3px] 
            [[data-state=open]>&]:ring-ring/30 
            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
            in-data-[invalid=true]:border-destructive/60 in-data-[invalid=true]:ring-destructive/10  dark:in-data-[invalid=true]:border-destructive dark:in-data-[invalid=true]:ring-destructive/20
          `,
      },
      placeholder: {
        true: "text-muted-foreground",
        false: "",
      },
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: "ghost",
        mode: "default",
        className: ICON_SUBTLE,
      },
      {
        variant: "outline",
        mode: "default",
        className: ICON_SUBTLE,
      },
      {
        variant: "dashed",
        mode: "default",
        className: ICON_SUBTLE,
      },
      {
        variant: "secondary",
        mode: "default",
        className: ICON_SUBTLE,
      },

      // Icons opacity for default mode
      {
        variant: "outline",
        mode: "input",
        className: ICON_SUBTLE,
      },
      {
        variant: "outline",
        mode: "icon",
        className: ICON_SUBTLE,
      },

      // Auto height
      {
        size: "md",
        autoHeight: true,
        className: "h-auto min-h-8.5",
      },
      {
        size: "sm",
        autoHeight: true,
        className: "h-auto min-h-7",
      },
      {
        size: "lg",
        autoHeight: true,
        className: "h-auto min-h-10",
      },

      // Shadow support
      {
        variant: "primary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "mono",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "secondary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "outline",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "dashed",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "destructive",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },

      // Shadow support
      {
        variant: "primary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "mono",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "secondary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "outline",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "dashed",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "destructive",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },

      // Link
      {
        variant: "primary",
        mode: "link",
        underline: "solid",
        className: `font-medium text-primary hover:text-primary/90 ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-solid`,
      },
      {
        variant: "primary",
        mode: "link",
        underline: "dashed",
        className: `font-medium text-primary hover:text-primary/90 ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1`,
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "solid",
        className: `font-medium text-primary hover:text-primary/90 ${ICON_SUBTLE} underline underline-offset-4 decoration-solid`,
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "dashed",
        className:
          "font-medium text-primary hover:text-primary/90 [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1",
      },

      {
        variant: "inverse",
        mode: "link",
        underline: "solid",
        className: `font-medium text-inherit ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-solid`,
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "dashed",
        className: `font-medium text-inherit ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1`,
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "solid",
        className: `font-medium text-inherit ${ICON_SUBTLE} underline underline-offset-4 decoration-solid`,
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "dashed",
        className: `font-medium text-inherit ${ICON_SUBTLE} underline underline-offset-4 decoration-dashed decoration-1`,
      },

      {
        variant: "foreground",
        mode: "link",
        underline: "solid",
        className: `font-medium text-foreground ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-solid`,
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "dashed",
        className: `font-medium text-foreground ${ICON_SUBTLE} hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1`,
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "solid",
        className: `font-medium text-foreground ${ICON_SUBTLE} underline underline-offset-4 decoration-solid`,
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "dashed",
        className: `font-medium text-foreground ${ICON_SUBTLE} underline underline-offset-4 decoration-dashed decoration-1`,
      },

      // Ghost
      {
        variant: "primary",
        appearance: "ghost",
        className:
          "bg-transparent text-primary/90 hover:bg-primary/5 data-[state=open]:bg-primary/5",
      },
      {
        variant: "destructive",
        appearance: "ghost",
        className:
          "bg-transparent text-destructive/90 hover:bg-destructive/5 data-[state=open]:bg-destructive/5",
      },
      {
        variant: "ghost",
        mode: "icon",
        className: "text-muted-foreground",
      },

      // Size
      // sm icon-mode note (audit P2): bumped from w-7/h-7 (28px) to a w-8/h-8
      // (32px) floor, closer to the 44x44px tap-target recommendation while
      // staying inside this size's compact visual density. See the `size`
      // sizing note above for the broader desktop-density tradeoff this
      // component makes.
      {
        size: "sm",
        mode: "icon",
        className: "w-8 h-8 p-0 [[&_svg:not([class*=size-])]:size-3.5",
      },
      {
        size: "md",
        mode: "icon",
        className: "w-8.5 h-8.5 p-0 [&_svg:not([class*=size-])]:size-4",
      },
      {
        size: "lg",
        mode: "icon",
        className: "w-10 h-10 p-0 [&_svg:not([class*=size-])]:size-4",
      },

      // Input mode
      {
        mode: "input",
        placeholder: true,
        variant: "outline",
        className: "font-normal text-muted-foreground",
      },
      {
        mode: "input",
        variant: "outline",
        size: "sm",
        className: "gap-1.25",
      },
      {
        mode: "input",
        variant: "outline",
        size: "md",
        className: "gap-1.5",
      },
      {
        mode: "input",
        variant: "outline",
        size: "lg",
        className: "gap-1.5",
      },
    ],

    defaultVariants: {
      variant: "primary",
      mode: "default",
      size: "md",
      shape: "default",
      appearance: "default",
    },
  }
);

function Button({
  className,
  onClick,
  selected,
  variant,
  shape,
  appearance,
  mode,
  size,
  autoHeight,
  underlined,
  underline,
  asChild = false,
  placeholder = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          shape,
          appearance,
          mode,
          autoHeight,
          placeholder,
          underlined,
          underline,
          className,
        }),
        asChild && props.disabled && "pointer-events-none opacity-50"
      )}
      onClick={onClick}
      {...(selected && { "data-state": "open" })}
      {...props}
    />
  );
}

function ButtonArrow({ icon: Icon = ChevronDown, className, ...props }) {
  return (
    <Icon
      data-slot="button-arrow"
      className={cn("ms-auto -me-1", className)}
      {...props}
    />
  );
}

export { Button, ButtonArrow, buttonVariants };
