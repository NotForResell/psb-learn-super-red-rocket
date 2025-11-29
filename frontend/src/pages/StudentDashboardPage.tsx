import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Link as MuiLink,
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { Link } from "react-router-dom";
import { getStudentCourses } from "../api/coursesApi";
import { getMySubmissions } from "../api/submissionsApi";
import { getMyProgress } from "../api/progressApi";
import { getMyFeed } from "../api/feedApi";
import CourseCard from "../components/common/CourseCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import AssignmentStatusChip from "../components/common/AssignmentStatusChip";
import { Course, FeedItem, ProgressSnapshot, Submission } from "../types/domain";

const StudentDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ enrolled: Course[]; available: Course[] }>({ enrolled: [], available: [] });
  const [progress, setProgress] = useState<ProgressSnapshot[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseResp, submissionResp, progressResp, feedResp] = await Promise.all([
          getStudentCourses(),
          getMySubmissions(),
          getMyProgress(),
          getMyFeed()
        ]);
        setCourses(courseResp);
        setSubmissions(submissionResp);
        setProgress(progressResp);
        setFeedItems(feedResp);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progressByCourse = useMemo(
    () =>
      progress.reduce<Record<number, ProgressSnapshot>>((acc, item) => {
        acc[item.course_id] = item;
        return acc;
      }, {}),
    [progress]
  );

  const nearestAssignments = submissions.slice(0, 5);

  if (loading) {
    return <LoadingSpinner label="Собираем ваши курсы и задания..." />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Моя учёба
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6">Мои курсы</Typography>
              <Typography variant="body2" color="text.secondary">
                Ваши активные программы обучения с прогрессом и краткими описаниями.
              </Typography>
      </Box>
            <Chip label={`${courses.enrolled.length} активных`} color="primary" />
          </Stack>
          {courses.enrolled.length === 0 ? (
            <EmptyState title="Нет записей" description="Запишитесь на курс, чтобы начать учиться." />
          ) : (
            <Grid container spacing={2}>
              {courses.enrolled.map((course) => (
                <Grid item xs={12} md={6} key={course.id}>
                  <MuiLink component={Link} to={`/courses/${course.id}`} underline="none">
                    <CourseCard
                      course={course}
                      completed={progressByCourse[course.id]?.completed_lessons_count ?? 0}
                      total={progressByCourse[course.id]?.total_lessons_count ?? 0}
                    />
                  </MuiLink>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ближайшие задания
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Здесь отображаются последние отправленные работы и их статус. Используйте их, чтобы быстро перейти к
            правкам или посмотреть комментарии.
          </Typography>
          {nearestAssignments.length === 0 ? (
            <EmptyState
              title="Заданий пока нет"
              description="Откройте уроки курса, чтобы найти задания и отправить первую работу."
            />
          ) : (
            <Stack divider={<Divider flexItem />} spacing={2}>
              {nearestAssignments.map((submission) => (
                <Stack key={submission.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">Работа #{submission.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Комментарий: {submission.student_comment || "без комментариев"}
                    </Typography>
      </Box>
                  <AssignmentStatusChip status={submission.status} />
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Доступные курсы
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Рекомендации, на которые можно записаться. Вижу краткое описание, уровень и предполагаемую длительность.
          </Typography>
          {courses.available.length === 0 ? (
            <EmptyState title="Пока нет рекомендаций" description="Позже здесь появятся новые курсы." />
          ) : (
            <Grid container spacing={2}>
              {courses.available.map((course) => (
                <Grid item xs={12} md={6} key={course.id}>
                  <CourseCard course={course} completed={0} total={course.estimated_hours ?? 0} />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Что нового
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Последние изменения по вашим курсам: новые задания, оценки и комментарии.
          </Typography>
          {feedItems.length === 0 ? (
            <EmptyState
              title="Пока нет новых событий"
              description="Выполните задания или дождитесь новых материалов от преподавателей."
            />
          ) : (
            <List>
              {feedItems.map((item) => (
                <ListItem key={item.id} alignItems="flex-start" divider>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={item.type === "new_assignment" ? "Новое задание" : "Новая оценка"}
                          color={item.type === "new_assignment" ? "info" : "success"}
                        />
                        <Typography variant="subtitle1">{item.short_text}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Курс: {item.course_title}
                        </Typography>
                        {item.assignment_title && (
                          <Typography variant="body2" color="text.secondary">
                            Задание: {item.assignment_title}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.created_at).toLocaleString()}
                        </Typography>
                      </Stack>
                    }
                  />
                  {item.type === "grade_updated" && (
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                      {item.score ?? "—"} / {item.max_score ?? "—"}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default StudentDashboardPage;



