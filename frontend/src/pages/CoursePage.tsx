import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseDetail, getCourseStructure } from "../api/coursesApi";
import { getProgressByCourse } from "../api/progressApi";
import { getTestsByCourse } from "../api/testsApi";
import CourseChatTab from "../components/CourseChatTab";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LessonNav from "../components/common/LessonNav";
import { PsbButton } from "../components/common/PsbButton";
import { CourseDetail, CourseStructureResponse, ProgressSnapshot, TestSummary } from "../types/domain";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [structure, setStructure] = useState<CourseStructureResponse | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const [courseResp, structureResp, progressResp, testsResp] = await Promise.all([
          getCourseDetail(Number(courseId)),
          getCourseStructure(Number(courseId)),
          getProgressByCourse(Number(courseId)),
          getTestsByCourse(Number(courseId))
        ]);
        setCourse(courseResp);
        setStructure(structureResp);
        setProgress(progressResp);
        setTests(testsResp);
      } catch (e) {
        setError("Не удалось загрузить данные курса");
        setCourse(null);
        setStructure(null);
        setProgress(null);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if (loading) {
    return <LoadingSpinner label="Загружаем данные курса..." />;
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6" mb={2}>
          Не удалось загрузить данные курса
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Попробуйте обновить страницу чуть позже.
        </Typography>
        <PsbButton psbVariant="secondary" onClick={() => navigate(-1)}>
          Вернуться назад
        </PsbButton>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6" mb={1}>
          Данные курса недоступны
        </Typography>
        <Typography variant="body2" color="text.secondary">
          В демо-режиме покажем краткое описание курса.
        </Typography>
      </Box>
    );
  }

  const progressValue =
    progress && progress.total_lessons_count > 0
      ? Math.round((progress.completed_lessons_count / progress.total_lessons_count) * 100)
      : 0;

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Уровень: {course.level} · Уроков: {course.lessons_count} · Заданий: {course.assignments_count}
          </Typography>
          <LinearProgress value={progressValue} variant="determinate" sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Материалы" />
            <Tab label="Обсуждение" />
          </Tabs>
        </CardContent>
      </Card>

      {tab === 0 && (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Материалы курса
                  </Typography>
                  <LessonNav
                    structure={structure}
                    onSelectLesson={(lessonId) => navigate(`/courses/${course.id}/lessons/${lessonId}`)}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ minHeight: 260 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Описание курса
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.long_description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Тесты курса
              </Typography>
              <Grid container spacing={2}>
                {tests.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Тестов пока нет.
                    </Typography>
                  </Grid>
                )}
                {tests.map((test) => (
                  <Grid item xs={12} md={6} key={test.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{test.title}</Typography>
                        {test.timeLimitMinutes && (
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Время: {test.timeLimitMinutes} мин
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {test.description ?? "Без описания"}
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => navigate(`/tests/${test.id}`)}>
                          Пройти тест
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <CourseChatTab courseId={course.id} />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default CoursePage;
