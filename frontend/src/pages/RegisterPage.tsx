import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuthStore } from "../store/authStore";
import LogoOriginal from "../assets/psb-logo-original.png";
import { psbBackgroundGradient, psbButtonGradient, psbCardBorderGradient } from "../theme/theme";
import { PsbButton } from "../components/common/PsbButton";

const schema = z
  .object({
    email: z.string().email("Укажите корректный email"),
    full_name: z.string().min(2, "Укажите имя"),
    password: z.string().min(1, "Пароль обязателен"),
    confirm: z.string(),
    role: z.enum(["student", "teacher"], { errorMap: () => ({ message: "Выберите роль в системе" }) })
  })
  .refine((data) => data.password === data.confirm, {
    message: "Пароли должны совпадать",
    path: ["confirm"]
  });

type FormValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, error, isLoading, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "student@example.com",
      full_name: "Иван Иванов",
      password: "password",
      confirm: "password",
      role: "student"
    }
  });

  const onSubmit = async (data: FormValues) => {
    await registerUser({
      email: data.email,
      full_name: data.full_name,
      password: data.password,
      role: data.role
    });
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: 2,
        backgroundImage: psbBackgroundGradient,
        backgroundSize: "180% 180%",
        animation: "psbGradientShift 36s ease-in-out infinite alternate"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 18% 82%, rgba(0,68,169,0.28) 0%, rgba(0,68,169,0.12) 32%, transparent 60%),
            radial-gradient(circle at 78% 12%, rgba(255,122,0,0.28) 0%, rgba(255,122,0,0.12) 36%, transparent 60%)
          `,
          pointerEvents: "none"
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 520, zIndex: 1 }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            backgroundColor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(14px)",
            borderRadius: 12,
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            border: "2px solid transparent",
            outline: "1px solid rgba(255,122,0,0.18)",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.96), rgba(255,255,255,0.96)), ${psbCardBorderGradient}`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            animation: "psbCardBreathe 14s ease-in-out infinite",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -2,
              borderRadius: 12,
              pointerEvents: "none"
            }
          }}
        >

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Box component="img" src={LogoOriginal} alt="Логотип ПСБ" sx={{ height: 56, width: "auto", mb: 1 }} />
                <Typography variant="h5" fontWeight={800} color="primary">
                  Регистрация в PSB Learn
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Создайте аккаунт для доступа к курсам, тестам и аналитике.
                </Typography>
              </Box>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="E-mail"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register("email")}
                    onChange={(e) => {
                      clearError();
                      register("email").onChange(e);
                    }}
                  />
                  <TextField
                    label="Фамилия и имя"
                    fullWidth
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    {...register("full_name")}
                  />
                  <TextField
                    label="Пароль"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    error={!!errors.password}
                    {...register("password")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            sx={{
                              color: showPassword ? "secondary.main" : "primary.main",
                              "&:hover": { color: "secondary.main" }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
                  <TextField
                    label="Подтверждение пароля"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    error={!!errors.confirm}
                    helperText={errors.confirm?.message}
                    {...register("confirm")}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="role"
                    label="Роль"
                    error={!!errors.role}
                    helperText={errors.role?.message}
                    {...register("role")}
                  >
                    <MenuItem value="student">Студент ПСБ</MenuItem>
                    <MenuItem value="teacher">Преподаватель / куратор</MenuItem>
                  </TextField>
                  {error && <Alert severity="error">{error}</Alert>}
                  <PsbButton type="submit" psbVariant="login" disabled={isLoading} size="large" fullWidth>
                    Создать аккаунт
                  </PsbButton>
                </Stack>
              </form>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Уже есть аккаунт?{" "}
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  underline="none"
                  sx={{
                    fontWeight: 700,
                    color: "secondary.main",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: -2,
                      width: "100%",
                      height: 2,
                      background: psbButtonGradient,
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.2s ease-out"
                    },
                    "&:hover::after": {
                      transform: "scaleX(1)"
                    }
                  }}
                >
                  Войти
                </MuiLink>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;
