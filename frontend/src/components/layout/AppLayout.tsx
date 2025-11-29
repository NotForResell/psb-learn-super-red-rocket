import { Box, Container, Stack } from "@mui/material";
import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { psbBackgroundGradient } from "../../theme/theme";

interface Props {
  children: ReactNode;
}

const SIDEBAR_WIDTH = 260;

const AppLayout = ({ children }: Props) => {
  const { loadProfile } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    loadProfile().catch(() => null);
  }, [loadProfile]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundImage: psbBackgroundGradient,
        backgroundSize: "200% 200%",
        animation: "psbBgDrift 40s ease-in-out infinite alternate",
        "@keyframes psbBgDrift": {
          "0%": { backgroundPosition: "0% 100%" },
          "50%": { backgroundPosition: "100% 0%" },
          "100%": { backgroundPosition: "0% 100%" }
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 18% 85%, rgba(0,68,169,0.35) 0%, rgba(0,68,169,0.18) 30%, transparent 60%),
            radial-gradient(circle at 82% 12%, rgba(255,122,0,0.32) 0%, rgba(255,122,0,0.12) 35%, transparent 60%)
          `,
          pointerEvents: "none"
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          pl: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          pr: 2
        }}
      >
        <Header />
      </Box>

      <Stack direction="row" sx={{ position: "relative", zIndex: 1 }}>
        <Sidebar />

        <Container
          sx={{
            py: 4,
            maxWidth: "1200px",
            position: "relative",
            pl: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
            transition: "padding-left 0.25s ease"
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 20px 55px rgba(0,0,0,0.15)",
                  borderRadius: 0,
                  p: { xs: 2.5, md: 3.5 },
                  minHeight: "calc(100vh - 120px)"
                }}
              >
                {children}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Container>
      </Stack>
    </Box>
  );
};

export default AppLayout;
