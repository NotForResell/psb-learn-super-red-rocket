import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import AssignmentStatusChip from "../components/common/AssignmentStatusChip";
import { getMyDeadlines } from "../api/deadlinesApi";
import { DeadlineItem } from "../types/domain";

const severityChip = (severity: DeadlineItem["severity"]) => {
  switch (severity) {
    case "overdue":
      return <Chip label="Просрочено" color="error" size="small" />;
    case "due_soon":
      return <Chip label="Скоро дедлайн" color="warning" size="small" />;
    default:
      return <Chip label="Обычный дедлайн" size="small" />;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "Без даты";
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const renderStatusChip = (status: DeadlineItem["status"]) => {
  if (status === "not_submitted") {
    return <Chip label="Не отправлено" size="small" />;
  }
  return <AssignmentStatusChip status={status as any} />;
};

const daysLeftText = (daysLeft?: number | null) => {
  if (daysLeft === null || daysLeft === undefined) return "Срок не указан";
  if (daysLeft < 0) return `Просрочено на ${Math.abs(daysLeft)} дн.`;
  if (daysLeft === 0) return "Срок сегодня";
  return `Осталось ${daysLeft} дн.`;
};

const CalendarPage = () => {
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyDeadlines();
        setItems(response);
      } catch (err) {
        setError("Не удалось загрузить календарь дедлайнов.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Собираем дедлайны по всем заданиям..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Календарь дедлайнов
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь отображаются все ваши задания по датам сдачи. Обратите внимание на задания с истекающими и просроченными
          сроками.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState title="На данный момент у вас нет заданий с дедлайнами." />
          ) : (
            <List>
              {items.map((item) => (
                <ListItem key={`${item.assignment_id}-${item.due_date ?? "no-date"}`} alignItems="flex-start" divider>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1">{item.assignment_title}</Typography>
                        {severityChip(item.severity)}
                        {renderStatusChip(item.status)}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Курс: {item.course_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Урок: {item.lesson_title ?? "—"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Дата сдачи: {formatDate(item.due_date)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {daysLeftText(item.days_left)}
                        </Typography>
                      </Stack>
                    }
                  />
                  <Button variant="outlined" href={`/assignments/${item.assignment_id}`} sx={{ alignSelf: "center" }}>
                    Перейти к заданию
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CalendarPage;
