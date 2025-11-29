import { ChangeEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getAssignment } from "../api/assignmentsApi";
import { getMySubmissionsByAssignment, submitWork } from "../api/submissionsApi";
import AssignmentStatusChip from "../components/common/AssignmentStatusChip";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { PsbButton } from "../components/common/PsbButton";
import { AssignmentWithSubmission, Submission } from "../types/domain";

const AssignmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [data, setData] = useState<AssignmentWithSubmission | null>(null);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!assignmentId) return;
      setLoading(true);
      const [assignmentResp, submissionsResp] = await Promise.all([
        getAssignment(Number(assignmentId)),
        getMySubmissionsByAssignment(Number(assignmentId))
      ]);
      setData(assignmentResp);
      setHistory(submissionsResp);
      setComment(assignmentResp.submission?.student_comment ?? "");
      setLoading(false);
    };
    load();
  }, [assignmentId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    setFiles(Array.from(selectedFiles));
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;
    await submitWork(Number(assignmentId), comment, files);
    const [updated, submissionsResp] = await Promise.all([
      getAssignment(Number(assignmentId)),
      getMySubmissionsByAssignment(Number(assignmentId))
    ]);
    setData(updated);
    setHistory(submissionsResp);
  };

  if (loading || !data) {
    return <LoadingSpinner label="Загружаем описание задания..." />;
  }

  const { assignment, submission } = data;
  const getSubmissionFileUrl = (item: Submission) => {
    if (item.file_url) return item.file_url;
    if (item.attachment_url) return item.attachment_url;
    if (item.submission_url) return item.submission_url;
    const firstFile = item.files?.[0];
    return firstFile ? `/api/v1/submissions/files/${firstFile.id}/download` : "";
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Задание: {assignment.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Подготовьте и загрузите работу. Здесь вы увидите статус проверки и комментарии.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6">Что нужно сделать</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {assignment.description}
          </Typography>
          <Typography variant="body2">
            Условия оценки: до {assignment.max_score} баллов · Дедлайн:{" "}
            {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : "не указан"}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статус вашей работы
          </Typography>
          {submission ? (
            <Stack spacing={1}>
              <AssignmentStatusChip status={submission.status} />
              <Typography variant="body2" color="text.secondary">
                Оценка: {submission.score ?? "ожидается"}
              </Typography>
              {submission.teacher_comment && (
                <Chip label={`Комментарий преподавателя: ${submission.teacher_comment}`} color="secondary" />
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Вы ещё не отправили работу. После отправки появится статус.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Форма отправки
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Добавьте пояснения и прикрепите файлы. Drag&drop: перетащите файлы или нажмите на кнопку выбора.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Комментарий к вашей работе (по желанию)"
              multiline
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button variant="outlined" component="label">
              Перетащите файлы сюда или нажмите, чтобы выбрать
              <input type="file" multiple hidden onChange={handleFileChange} />
            </Button>
            {files.length > 0 && (
              <List dense>
                {files.map((file) => (
                  <ListItem key={file.name}>
                    <ListItemText primary={file.name} secondary={`${Math.round(file.size / 1024)} КБ`} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button variant="contained" onClick={handleSubmit}>
              Отправить работу
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            История отправок
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Здесь отображаются все ваши попытки по этому заданию. Новейшие попытки показываются первыми.
          </Typography>
          {history.length === 0 ? (
            <EmptyState title="Вы ещё не отправляли работу" description="После первой отправки здесь появятся записи." />
          ) : (
            <List>
              {history.map((item) => {
                const fileUrl = getSubmissionFileUrl(item);
                return (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle1">Попытка №{item.attempt_number}</Typography>
                          <AssignmentStatusChip status={item.status} />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Оценка: {item.score ?? "—"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Отправлено: {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Проверено: {item.checked_at ? new Date(item.checked_at).toLocaleString() : "—"}
                          </Typography>
                          {fileUrl ? (
                            <PsbButton
                              psbVariant="secondary"
                              component="a"
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ alignSelf: "flex-start" }}
                            >
                              Открыть
                            </PsbButton>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-start" }}>
                              Файл не прикреплён
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AssignmentPage;
