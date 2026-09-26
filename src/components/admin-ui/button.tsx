import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 outline-none focus-visible:shadow-(--shadow-focus) disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 not-disabled:hover:scale-[1.02] not-disabled:active:scale-95",
  {
    variants: {
      variant: {
        default:
          'border border-(--color-border-default) bg-[rgba(19,19,19,0.623)] text-white shadow-(--shadow-glow-sm) backdrop-blur-xl hover:border-(--color-hero-ring) hover:shadow-(--shadow-glow-md)',
        destructive:
          'border border-destructive/50 bg-destructive/15 text-destructive shadow-[0_0_5px_hsla(350,100%,68%,0.4)] hover:border-destructive hover:shadow-[0_0_25px_hsla(350,100%,68%,0.45)]',
        outline:
          'border border-(--color-border-default) bg-transparent text-foreground hover:border-(--color-hero-ring) hover:bg-muted hover:shadow-(--shadow-glow-sm)',
        secondary:
          'border border-(--color-border-default) bg-secondary text-secondary-foreground hover:border-(--color-hero-ring) hover:shadow-(--shadow-glow-sm)',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline hover:scale-100',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        xs: "h-6 gap-1 rounded-xl px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 rounded-xl px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-5',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
