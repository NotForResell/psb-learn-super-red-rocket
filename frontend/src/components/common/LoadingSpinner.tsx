import { CircularProgress, Stack, Typography } from "@mui/material";

interface Props {
  label?: string;
}

const LoadingSpinner = ({ label = "Загружаем данные..." }: Props) => (
  <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6 }}>
    <CircularProgress color="primary" />
    <Typography variant="body1" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

export default LoadingSpinner;
