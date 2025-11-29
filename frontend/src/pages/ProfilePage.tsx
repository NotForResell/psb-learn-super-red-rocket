import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PsbButton } from "../components/common/PsbButton";
import { useAuthStore } from "../store/authStore";
import { getCurrentUser, updateProfile, changePassword } from "../api/profileApi";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, "ФИО обязательно")
    .max(200, "Слишком длинное ФИО")
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Текущий пароль обязателен"),
    new_password: z.string().min(6, "Новый пароль должен быть не менее 6 символов"),
    confirm_password: z.string().min(6, "Повторите новый пароль")
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"]
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: meData } = useQuery(["me"], getCurrentUser, {
    onSuccess: (data) => {
      if (data) {
        setUser(data);
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
    }
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: meData?.full_name || user?.full_name || ""
    }
  });

  useEffect(() => {
    resetProfile({
      full_name: meData?.full_name || user?.full_name || ""
    });
  }, [meData, user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const profileMutation = useMutation(updateProfile, {
    onSuccess: async (updated) => {
      setUser(updated);
      await queryClient.invalidateQueries(["me"]);
    }
  });

  const passwordMutation = useMutation(changePassword, {
    onSuccess: () => {
      resetPassword({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    }
  });

  const onSubmitProfile = async (values: ProfileFormValues) => {
    await profileMutation.mutateAsync({
      full_name: values.full_name,
      avatar_url: avatarPreview || null
    });
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    await passwordMutation.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const initials =
    user?.full_name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "DS";

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Профиль
      </Typography>

      <Grid container spacing={3}>
        {/* Основные данные */}
        <Grid item xs={12}>
          <Card
            square
            sx={{
              width: "100%",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
              borderRadius: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.8)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Основные данные
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmitProfile(onSubmitProfile)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <TextField
                    label="ФИО"
                    fullWidth
                    defaultValue={user?.full_name || ""}
                    {...registerProfile("full_name")}
                    error={!!profileErrors.full_name}
                    helperText={profileErrors.full_name?.message}
                  />
                  <TextField
                    label="E-mail"
                    fullWidth
                    value={user?.email || ""}
                    disabled
                  />
                  <TextField
                    label="Роль"
                    fullWidth
                    value={user?.role || "Студент"}
                    disabled
                  />
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <PsbButton
                      type="submit"
                      psbVariant="primary"
                      disabled={isProfileSubmitting || profileMutation.isLoading}
                    >
                      Сохранить изменения
                    </PsbButton>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Фото профиля */}
        <Grid item xs={12}>
          <Card
            square
            sx={{
              width: "100%",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
              borderRadius: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.8)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Фото профиля
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 28,
                    bgcolor: "primary.main"
                  }}
                  src={avatarPreview || undefined}
                >
                  {initials}
                </Avatar>
                <Stack spacing={1.5}>
                  <PsbButton component="label" psbVariant="secondary">
                    Выбрать файл
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </PsbButton>
                  <Typography variant="body2" color="text.secondary" maxWidth={420}>
                    Поддерживаются изображения, пример сохранения url будет
                    добавлен позже.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Изменение пароля */}
        <Grid item xs={12}>
          <Card
            square
            sx={{
              width: "100%",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
              borderRadius: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.8)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Изменение пароля
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmitPassword(onSubmitPassword)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <TextField
                    label="Текущий пароль"
                    type="password"
                    fullWidth
                    {...registerPassword("current_password")}
                    error={!!passwordErrors.current_password}
                    helperText={passwordErrors.current_password?.message}
                  />
                  <TextField
                    label="Новый пароль"
                    type="password"
                    fullWidth
                    {...registerPassword("new_password")}
                    error={!!passwordErrors.new_password}
                    helperText={passwordErrors.new_password?.message}
                  />
                  <TextField
                    label="Подтверждение пароля"
                    type="password"
                    fullWidth
                    {...registerPassword("confirm_password")}
                    error={!!passwordErrors.confirm_password}
                    helperText={passwordErrors.confirm_password?.message}
                  />
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <PsbButton
                      type="submit"
                      psbVariant="primary"
                      disabled={
                        isPasswordSubmitting || passwordMutation.isLoading
                      }
                    >
                      Обновить пароль
                    </PsbButton>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
