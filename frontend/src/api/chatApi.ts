import httpClient from "./httpClient";
import { ChatMessage } from "../types/domain";

const mapMessage = (m: any): ChatMessage => ({
  id: m.id,
  courseId: m.course_id,
  authorId: m.author_id,
  authorName: m.author_name,
  isTeacher: m.is_teacher,
  text: m.text,
  createdAt: m.created_at
});

export const getCourseMessages = async (courseId: number, params?: { limit?: number }): Promise<ChatMessage[]> => {
  const response = await httpClient.get<{ items: any[] }>(`/api/v1/courses/${courseId}/chat/messages`, {
    params
  });
  return response.data.items.map(mapMessage);
};

export const postCourseMessage = async (courseId: number, text: string): Promise<ChatMessage> => {
  const response = await httpClient.post(`/api/v1/courses/${courseId}/chat/messages`, { text });
  return mapMessage(response.data);
};
