import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import GradingIcon from "@mui/icons-material/Grading";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useUiStore } from "../../store/uiStore";
import { psbButtonGradient, psbBlue, psbDeepBlue } from "../../theme/theme";

type NavItemProps = {
  to: string;
  primary: string;
  secondary?: string;
  icon: ReactNode;
  selected: boolean;
};

const NavItem = ({ to, primary, secondary, icon, selected }: NavItemProps) => (
  <motion.div whileHover={{ x: 4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <ListItemButton
      component={RouterLink}
      to={to}
      selected={selected}
      className="nav-item"
      sx={{
        my: 0.75,
        borderRadius: 9999,
        color: "rgba(255,255,255,0.82)",
        position: "relative",
        overflow: "hidden",
        px: 2.25,
        py: 1,
        transition:
          "background 0.2s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out, color 0.2s ease, text-shadow 0.2s ease",
        "& .MuiListItemIcon-root": {
          color: "inherit",
          minWidth: 38
        },
        "& .MuiListItemText-primary": {
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)"
        },
        "& .MuiListItemText-secondary": {
          color: "rgba(255,255,255,0.7)"
        },
        "&::before": selected
          ? {
              content: '""',
              position: "absolute",
              left: 10,
              top: "50%",
              width: 5,
              height: 28,
              transform: "translateY(-50%)",
              borderRadius: 999,
              backgroundColor: "#FF7A00"
            }
          : {},
        "&:hover": {
          color: "#FFFFFF",
          boxShadow: "0 12px 26px rgba(0,0,0,0.2)",
          background: "linear-gradient(120deg, rgba(0,68,169,0.35) 0%, rgba(255,122,0,0.18) 100%)"
        },
        "&.Mui-selected": {
          background: psbButtonGradient,
          color: psbDeepBlue,
          boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
          textShadow: "0 0 6px rgba(255,255,255,0.6)",
          "& .MuiListItemIcon-root": {
            transform: "scale(1.06)"
          },
          "& .MuiListItemText-primary": {
            color: psbDeepBlue,
            fontWeight: 700
          },
          "& .MuiListItemText-secondary": {
            color: "rgba(0,68,169,0.82)"
          },
          "&:hover": {
            background: psbButtonGradient,
            color: "#001C5A",
            textShadow: "0 0 6px rgba(255,255,255,0.6)",
            "& .MuiListItemText-primary": {
              color: "#001C5A"
            },
            "& .MuiListItemText-secondary": {
              color: "rgba(0,50,127,0.9)"
            }
          }
        }
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={primary} secondary={secondary} />
    </ListItemButton>
  </motion.div>
);

const Sidebar = () => {
  const { sidebarOpen, closeSidebar } = useUiStore();
  const location = useLocation();

  return (
    <Drawer
      anchor="left"
      variant="permanent"
      open={sidebarOpen}
      onClose={closeSidebar}
      sx={{ width: 260, flexShrink: 0 }}
      PaperProps={{
        sx: {
          width: 260,
          border: "none",
          background: "linear-gradient(180deg, rgba(6,20,58,0.9) 0%, rgba(10,30,72,0.9) 45%, rgba(6,16,48,0.92) 100%)",
          color: "#FFFFFF",
          backdropFilter: "blur(18px)",
          boxShadow: "10px 0 40px rgba(0,0,0,0.25)"
        }
      }}
    >
      <List sx={{ width: 260, px: 1.5, py: 2 }}>
        <NavItem
          to="/dashboard"
          selected={location.pathname.startsWith("/dashboard") || location.pathname === "/"}
          icon={<DashboardIcon />}
          primary="Главная"
          secondary="Сводка по обучению и заданиям"
        />
        <NavItem
          to="/progress"
          selected={location.pathname.startsWith("/progress")}
          icon={<TimelineIcon />}
          primary="Курсы и модули"
          secondary="Доступные программы и материалы"
        />
        <NavItem
          to="/grades"
          selected={location.pathname.startsWith("/grades")}
          icon={<GradingIcon />}
          primary="Тесты и контроль"
          secondary="Запланированные и пройденные тесты"
        />
        <NavItem
          to="/calendar"
          selected={location.pathname.startsWith("/calendar")}
          icon={<EventNoteIcon />}
          primary="Сообщения и поддержка"
          secondary="Обратная связь с преподавателями и службой поддержки"
        />
        <NavItem
          to="/profile"
          selected={location.pathname.startsWith("/profile")}
          icon={<PersonOutlineIcon />}
          primary="Профиль"
          secondary="Настройки аккаунта и безопасности"
        />
      </List>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
    </Drawer>
  );
};

export default Sidebar;
