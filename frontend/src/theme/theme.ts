import { createTheme } from "@mui/material/styles";

const PSB_COLORS = {
  blue: "#0044A9",
  orange: "#FF7A00",
  white: "#FFFFFF",
  backgroundSoft: "#F4F6FB",
  darkText: "#0F172A"
};

export const psbBlue = PSB_COLORS.blue;
export const psbDeepBlue = "#002B73";
export const psbOrange = PSB_COLORS.orange;
export const psbCardBorderGradient = "linear-gradient(90deg, #0044a9 0%, #5c8ff5 50%, #ff7a00 100%)";

export const psbBackgroundGradient = `linear-gradient(
  to top right,
  ${PSB_COLORS.blue} 0%,
  ${PSB_COLORS.white} 50%,
  ${PSB_COLORS.orange} 100%
)`;

export const psbButtonGradient = `linear-gradient(
  90deg,
  ${PSB_COLORS.blue} 0%,
  ${PSB_COLORS.white} 50%,
  ${PSB_COLORS.orange} 100%
)`;

export const psbButtonGradientReverse =
  "linear-gradient(90deg, #FF7A00 0%, #0044A9 100%)";

export const psbAnimatedGradient = {
  backgroundImage: psbBackgroundGradient,
  backgroundSize: "180% 180%",
  animation: "psbGradientShift 36s ease-in-out infinite alternate"
};

export const theme = createTheme({
  palette: {
    primary: {
      main: PSB_COLORS.blue
    },
    secondary: {
      main: PSB_COLORS.orange
    },
    background: {
      default: PSB_COLORS.backgroundSoft,
      paper: PSB_COLORS.white
    }
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { fontWeight: 700 }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minHeight: "100vh",
          backgroundImage: psbBackgroundGradient,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          color: PSB_COLORS.darkText
        },
        "@keyframes psbGradientShift": {
          "0%": { backgroundPosition: "0% 100%" },
          "50%": { backgroundPosition: "100% 0%" },
          "100%": { backgroundPosition: "0% 100%" }
        },
        "@keyframes psbCardAppear": {
          "0%": { opacity: 0, transform: "translateY(12px) scale(0.99)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        },
        "@keyframes psbCardBreathe": {
          "0%": { transform: "scale(0.995)" },
          "50%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.995)" }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: "none",
          fontWeight: 700,
          paddingInline: 22,
          paddingBlock: 11,
          backgroundImage: psbButtonGradient,
          backgroundSize: "150% 150%",
          backgroundPosition: "0% 50%",
          transition:
            "transform 0.18s ease-out, box-shadow 0.18s ease-out, background-position 0.8s ease-out, color 0.2s ease",
          boxShadow: "0 10px 22px rgba(0,0,0,0.16)",
          color: "#FFFFFF",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-1px) scale(1.01)",
            boxShadow: "0 14px 28px rgba(0,0,0,0.2)",
            backgroundPosition: "100% 50%",
            color: psbBlue,
            textShadow: "0 0 4px rgba(255,255,255,0.6)"
          },
          "&:active": {
            transform: "translateY(0) scale(0.99)",
            boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
            backgroundPosition: "30% 50%",
            color: psbOrange
          },
          "&.Mui-focusVisible": {
            color: "#FFFFFF"
          },
          "&.Mui-disabled": {
            backgroundImage: psbButtonGradient,
            filter: "grayscale(0.4)",
            opacity: 0.6,
            boxShadow: "none",
            color: "rgba(255,255,255,0.8)"
          }
        },
        containedPrimary: {
          color: "#FFFFFF"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.94)",
            transition: "all 0.18s ease-out",
            "& fieldset": {
              borderColor: "rgba(0,68,169,0.2)"
            },
            "&:hover fieldset": {
              borderColor: PSB_COLORS.blue
            },
            "&.Mui-focused fieldset": {
              borderColor: PSB_COLORS.orange,
              boxShadow: "0 0 0 3px rgba(0,68,169,0.16)"
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "14px 16px"
        }
      }
    }
  }
});
