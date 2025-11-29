import { Button, ButtonProps } from "@mui/material";
import { motion, MotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";
import { psbBlue, psbButtonGradient, psbButtonGradientReverse, psbOrange } from "../../theme/theme";

type Variant =
  | "primary"
  | "login"
  | "secondary"
  | "cta"
  | "dashboard"
  | "courses"
  | "tests"
  | "messages"
  | "profile";

interface PsbButtonProps extends ButtonProps {
  psbVariant?: Variant;
  children: ReactNode;
}

const MotionButton = motion(Button);

const variantAnimations: Record<Variant, MotionProps> = {
  primary: { whileHover: { scale: 1.01 }, whileTap: { scale: 0.98 }, transition: { duration: 0.25 } },
  login: { whileHover: { scale: 1.02 }, whileTap: { scale: 0.985 }, transition: { duration: 0.25 } },
  dashboard: {
    whileHover: { scale: 1.01, backgroundPositionX: "80%" },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.25 }
  },
  courses: {
    whileHover: { scale: 1.01, x: 2 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.25 }
  },
  tests: {
    whileHover: { scaleY: 1.03 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.25 }
  },
  secondary: { whileHover: { scale: 1.01 }, whileTap: { scale: 0.985 }, transition: { duration: 0.25 } },
  cta: { whileHover: { scale: 1.02 }, whileTap: { scale: 0.985 }, transition: { duration: 0.25 } },
  messages: {
    whileHover: { scale: 1.01, opacity: 0.96 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.25 }
  },
  profile: {
    whileHover: { scale: 1.01, opacity: 0.96 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.25 }
  }
};

export const PsbButton = forwardRef<HTMLButtonElement, PsbButtonProps>(
  ({ psbVariant = "primary", children, sx, ...rest }, ref) => {
    const motionProps = variantAnimations[psbVariant] || variantAnimations.primary;
    const gradientVariants: Variant[] = [
      "primary",
      "login",
      "secondary",
      "cta",
      "dashboard",
      "courses",
      "tests",
      "messages",
      "profile"
    ];
    const isGradientVariant = gradientVariants.includes(psbVariant);
    const gradientStyles = isGradientVariant
      ? {
          borderRadius: 999,
          overflow: "hidden",
          backgroundImage: psbButtonGradient,
          backgroundSize: "150% 150%",
          backgroundPosition: "0% 50%",
          color: "#FFFFFF",
          transition: "background 0.3s ease, color 0.2s ease, box-shadow 0.2s ease",
          textTransform: "none",
          fontWeight: 700,
          "&:hover": {
            backgroundImage: psbButtonGradientReverse,
            color: psbBlue,
            textShadow: "0 0 4px rgba(255,255,255,0.6)"
          },
          "&:active": {
            color: psbOrange
          }
        }
      : {};
    return (
      <MotionButton
        ref={ref}
        {...motionProps}
        variant="contained"
        sx={{
          borderRadius: 999,
          py: 1.3,
          px: 3.2,
          ...gradientStyles,
          ...sx
        }}
        {...rest}
      >
        {children}
      </MotionButton>
    );
  }
);

PsbButton.displayName = "PsbButton";
