import httpClient from "./httpClient";
import { Assignment, AssignmentWithSubmission } from "../types/domain";

export const getAssignmentByLesson = async (lessonId: number): Promise<Assignment> => {
  const response = await httpClient.get<Assignment>(`/api/v1/assignments/by-lesson/${lessonId}`);
  return response.data;
};

export const getAssignment = async (assignmentId: number): Promise<AssignmentWithSubmission> => {
  const response = await httpClient.get<AssignmentWithSubmission>(`/api/v1/assignments/${assignmentId}`);
  return response.data;
};
