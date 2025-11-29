import { Card, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { Course } from "../../types/domain";

interface Props {
  course: Course;
  completed?: number;
  total?: number;
}

const CourseCard = ({ course, completed = 0, total = 0 }: Props) => {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{course.title}</Typography>
            <Chip size="small" label={course.level} color="primary" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {course.short_description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Оценочная длительность: {course.estimated_hours ?? 0} ч · Метки: {course.tags ?? "нет"}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Прогресс: {completed}/{total} уроков
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
