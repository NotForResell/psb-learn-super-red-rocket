import httpClient from "./httpClient";
import { LessonWithAssignment } from "../types/domain";

export const getLesson = async (lessonId: number): Promise<LessonWithAssignment> => {
  const response = await httpClient.get<LessonWithAssignment>(`/api/v1/lessons/${lessonId}`);
  return response.data;
};
