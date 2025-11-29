import { List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { CourseStructureResponse } from "../../types/domain";

interface Props {
  structure: CourseStructureResponse | null;
  selectedLessonId?: number;
  onSelectLesson: (lessonId: number) => void;
}

const LessonNav = ({ structure, selectedLessonId, onSelectLesson }: Props) => {
  if (!structure) {
    return null;
  }
  return (
    <Stack spacing={2}>
      {structure.modules.map((module) => (
        <Stack key={module.id} spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Модуль {module.order_index}. {module.title}
          </Typography>
          <List dense sx={{ bgcolor: "white", borderRadius: 1, border: "1px solid #e5e7eb" }}>
            {module.lessons.map((lesson) => (
              <ListItemButton
                key={lesson.id}
                selected={lesson.id === selectedLessonId}
                onClick={() => onSelectLesson(lesson.id)}
              >
                <ListItemText
                  primary={`Урок ${lesson.order_index}. ${lesson.title}`}
                  secondary={lesson.short_description}
                />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
};

export default LessonNav;
