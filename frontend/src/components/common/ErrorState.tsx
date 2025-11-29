import { Alert, Button, Stack, Typography } from "@mui/material";

interface Props {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: Props) => (
  <Stack spacing={2} sx={{ py: 3 }}>
    <Alert severity="error">{message}</Alert>
    {onRetry && (
      <Button variant="contained" onClick={onRetry}>
        Повторить попытку
      </Button>
    )}
    <Typography variant="body2" color="text.secondary">
      Если проблема повторяется, убедитесь, что backend запущен и доступен.
    </Typography>
  </Stack>
);

export default ErrorState;
