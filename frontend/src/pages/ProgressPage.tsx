import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Divider, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { getMyProgress } from "../api/progressApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { ProgressSnapshot } from "../types/domain";

const ProgressPage = () => {
  const [progress, setProgress] = useState<ProgressSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const resp = await getMyProgress();
      setProgress(resp);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Собираем статистику по курсам..." />;
  }

  if (loading) {
    return <LoadingSpinner label="Собираем статистику по курсам..." />;
  }

  const totalCourses = progress.length;
  const totalLessons = progress.reduce((sum, p) => sum + p.total_lessons_count, 0);
  const completedLessons = progress.reduce((sum, p) => sum + p.completed_lessons_count, 0);
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const scoredItems = progress.filter((p) => typeof p.avg_score === "number");
  const avgScore =
    scoredItems.length > 0
      ? scoredItems.reduce((sum, p) => sum + (p.avg_score ?? 0), 0) / scoredItems.length
      : null;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Мой прогресс</Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь собраны ключевые цифры по всем вашим курсам: прогресс по урокам и средний балл.
        </Typography>
      </Stack>

      {progress.length === 0 ? (
        <EmptyState title="Пока нет данных" description="Как только вы начнёте учиться, здесь появятся цифры." />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Активных курсов
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {totalCourses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Количество программ, по которым у вас есть прогресс.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Общий прогресс
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {completionPercent}%
                    </Typography>
                    <Box mt={1.5}>
                      <LinearProgress
                        variant="determinate"
                        value={completionPercent}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Завершено уроков: {completedLessons} из {totalLessons}.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Средний балл
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {avgScore !== null ? avgScore.toFixed(1) : "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Средняя оценка по курсам, где уже есть проверки.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Прогресс по каждому курсу
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Следите за тем, какие курсы продвигаются лучше всего и где стоит усилить внимание.
                </Typography>

                <Stack spacing={2.5}>
                  {progress.map((item) => {
                    const value =
                      item.total_lessons_count > 0
                        ? Math.round((item.completed_lessons_count / item.total_lessons_count) * 100)
                        : 0;

                    const title = item.course_title || `Курс #${item.course_id}`;

                    return (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.02)"
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1.5}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Box sx={{ minWidth: 220 }}>
                            <Typography variant="subtitle1">{title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Уроки: {item.completed_lessons_count} / {item.total_lessons_count}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={value}
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: { xs: "unset", sm: 180 } }}
                          >
                            <Chip label={`${value}%`} color="primary" size="small" />
                            <Chip
                              label={
                                item.avg_score !== null && item.avg_score !== undefined
                                  ? `Средний балл: ${item.avg_score.toFixed(1)}`
                                  : "Оценки ещё нет"
                              }
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Stack>
      )}
    </Stack>
  );
};

export default ProgressPage;



