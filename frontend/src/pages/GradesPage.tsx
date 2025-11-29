import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import AssignmentStatusChip from "../components/common/AssignmentStatusChip";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { getMyGrades } from "../api/gradesApi";
import { GradeItem } from "../types/domain";

const GradesPage = () => {
  const [items, setItems] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyGrades();
        setItems(response);
      } catch (err) {
        setError("Не удалось загрузить оценки. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Загрузка оценок..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Мои оценки</Typography>
      </Stack>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState title="Оценок пока нет" description="Когда появятся проверенные задания, они будут здесь." />
          ) : (
            <TableContainer
              sx={{
                mt: 3,
                borderRadius: 3,
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                overflowX: "visible",
                width: "100%"
              }}
            >
              <Table sx={{ minWidth: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Курс</TableCell>
                    <TableCell>Задание</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Попытка</TableCell>
                    <TableCell>Баллы</TableCell>
                    <TableCell>Комментарий преподавателя</TableCell>
                    <TableCell>Обновлено</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={`${item.assignment_id}-${item.attempt_number ?? 0}`}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body1">{item.course_title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{item.course_id}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{item.assignment_title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{item.assignment_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <AssignmentStatusChip status={item.status} />
                      </TableCell>
                      <TableCell>
                        {item.attempt_number ? <Chip label={`П-${item.attempt_number}`} size="small" /> : "—"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {`${item.score ?? "—"} / ${item.max_score}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.teacher_comment ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.checked_at
                            ? new Date(item.checked_at).toLocaleString()
                            : item.submitted_at
                            ? new Date(item.submitted_at).toLocaleString()
                            : "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default GradesPage;
