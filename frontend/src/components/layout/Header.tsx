import { AppBar, Box, Stack, Toolbar, Typography } from "@mui/material";
import { useAuthStore } from "../../store/authStore";
import LogoWhite from "../../assets/psb-logo-white.png";
import { psbButtonGradient } from "../../theme/theme";
import { PsbButton } from "../common/PsbButton";

const Header = () => {
  const { user, logout } = useAuthStore();
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundImage: psbButtonGradient,
        color: "#FFFFFF",
        boxShadow: "0 6px 16px rgba(0,0,0,0.16)"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            component="img"
            src={LogoWhite}
            alt="Логотип ПСБ"
            sx={{ height: 56, width: "auto", mr: 1.5, display: "block" }}
          />
          <Typography variant="h6" fontWeight={800}>
            PSB Learn — цифровая платформа обучения
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          {user && (
            <Box textAlign="right">
              <Typography variant="body2">{user.full_name}</Typography>
              <Typography variant="caption" color="#E5E7EB">
                ПСБ | Внутренняя платформа обучения · {user.role === "teacher" ? "Преподаватель" : "Студент"}
              </Typography>
            </Box>
          )}
          <PsbButton psbVariant="profile" size="small" onClick={logout}>
            Выйти из системы
          </PsbButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
