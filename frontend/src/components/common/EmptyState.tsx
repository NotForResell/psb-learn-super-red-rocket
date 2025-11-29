import { Box, Typography } from "@mui/material";

interface Props {
  title: string;
  description?: string;
}

const EmptyState = ({ title, description }: Props) => (
  <Box sx={{ p: 3, textAlign: "center" }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
  </Box>
);

export default EmptyState;
