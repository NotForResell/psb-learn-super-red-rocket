import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getLesson } from "../api/lessonsApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { LessonWithAssignment } from "../types/domain";

const LessonPage = () => {
  const { lessonId, courseId } = useParams<{ lessonId: string; courseId: string }>();
  const [data, setData] = useState<LessonWithAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!lessonId) return;
      setLoading(true);
      const response = await getLesson(Number(lessonId));
      setData(response);
      setLoading(false);
    };
    load();
  }, [lessonId]);

  if (loading || !data) {
    return <LoadingSpinner label="Открываем материалы урока..." />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {data.lesson.title}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Материалы урока
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ознакомьтесь с описанием, следуйте шагам и возвращайтесь к заданиям, чтобы закрепить знания.
          </Typography>
          <Box
            sx={{ "& p": { mb: 1.5 }, "& ul": { pl: 3 } }}
            dangerouslySetInnerHTML={{ __html: data.lesson.content_html }}
          />
        </CardContent>
      </Card>

      {data.assignment && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Задание к уроку
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {data.assignment.description}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to={`/assignments/${data.assignment.id}`}
              sx={{ alignSelf: "flex-start" }}
            >
              Перейти к отправке работы
            </Button>
          </CardContent>
        </Card>
      )}

      <Button component={RouterLink} to={`/courses/${courseId}`} variant="text">
        Назад к структуре курса
      </Button>
    </Stack>
  );
};

export default LessonPage;


