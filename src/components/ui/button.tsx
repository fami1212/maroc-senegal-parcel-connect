import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-card hover:shadow-elegant transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card hover:shadow-elegant transition-all duration-300",
        outline:
          "border-2 border-primary/20 bg-background hover:bg-primary/5 hover:border-primary/40 text-primary transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-card hover:shadow-elegant transition-all duration-300",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
        
        /* Modern delivery app variants */
        delivery: "bg-gradient-primary text-primary-foreground shadow-button hover:shadow-elegant hover:scale-105 transition-all duration-300 font-semibold",
        "delivery-secondary": "bg-gradient-secondary text-secondary-foreground shadow-button hover:shadow-elegant hover:scale-105 transition-all duration-300 font-semibold",
        "delivery-accent": "bg-gradient-accent text-accent-foreground shadow-button hover:shadow-elegant hover:scale-105 transition-all duration-300 font-semibold",
        
        /* Hero and CTA variants */
        hero: "bg-gradient-hero text-primary-foreground shadow-elegant hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold text-lg",
        cta: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-button hover:shadow-glow font-semibold transition-all duration-300 hover:scale-105",
        
        /* Special floating action button */
        floating: "bg-gradient-primary text-primary-foreground shadow-float hover:shadow-glow hover:scale-110 transition-all duration-300 rounded-full",
        
        /* New semantic variants */
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-card hover:shadow-elegant transition-all duration-300",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-card hover:shadow-elegant transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-lg": "h-12 w-12 rounded-xl",
        floating: "h-14 w-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
