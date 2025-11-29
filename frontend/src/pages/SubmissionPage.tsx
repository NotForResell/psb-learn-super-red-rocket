import { useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, Typography, Link as MuiLink } from "@mui/material";
import { useParams } from "react-router-dom";
import { getSubmission, downloadSubmissionFile, getMySubmissionsByAssignment } from "../api/submissionsApi";
import { getAssignment } from "../api/assignmentsApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AssignmentStatusChip from "../components/common/AssignmentStatusChip";
import { Assignment, Submission } from "../types/domain";

const SubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!submissionId) return;
      setLoading(true);
      const submissionResp = await getSubmission(Number(submissionId));
      setSubmission(submissionResp);
      const assignmentResp = await getAssignment(submissionResp.assignment_id);
      setAssignment(assignmentResp.assignment);
      const attempts = await getMySubmissionsByAssignment(submissionResp.assignment_id);
      setTotalAttempts(attempts.length);
      setLoading(false);
    };
    load();
  }, [submissionId]);

  const handleDownload = async (fileId: number, fileName: string) => {
    const response = await downloadSubmissionFile(fileId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading || !submission) {
    return <LoadingSpinner label="Загрузка данных отправки..." />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Отправка задания
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Попытка №{submission.attempt_number}{" "}
          {totalAttempts ? `(из ${totalAttempts})` : ""}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6">Детали задания и курса</Typography>
          <Typography variant="body2" color="text.secondary">
            {assignment ? `Задание: ${assignment.title}` : "Задание загружается..."}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Статус проверки</Typography>
          <AssignmentStatusChip status={submission.status} />
          <Typography variant="body2" color="text.secondary" mt={1}>
            Оценка: {submission.score ?? "Нет данных"}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Комментарий студента</Typography>
          <Typography variant="body2" color="text.secondary">
            {submission.student_comment || "Комментарий отсутствует"}
          </Typography>
        </CardContent>
      </Card>

      {submission.teacher_comment && (
        <Card>
          <CardContent>
            <Typography variant="h6">Комментарий преподавателя</Typography>
            <Typography variant="body2" color="text.secondary">
              {submission.teacher_comment}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Файлы
          </Typography>
          {submission.files.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Файлы не прикреплены.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {submission.files.map((file) => (
                <MuiLink
                  component="button"
                  variant="body2"
                  key={file.id}
                  onClick={() => handleDownload(file.id, file.original_name)}
                >
                  Скачать {file.original_name}
                </MuiLink>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SubmissionPage;
