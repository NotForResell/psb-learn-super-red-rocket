import httpClient from "./httpClient";
import { ProgressSnapshot } from "../types/domain";

export const getMyProgress = async (): Promise<ProgressSnapshot[]> => {
  const response = await httpClient.get<ProgressSnapshot[]>("/api/v1/progress/my");
  return response.data;
};

export const getProgressByCourse = async (courseId: number): Promise<ProgressSnapshot> => {
  const response = await httpClient.get<ProgressSnapshot>(`/api/v1/progress/my/${courseId}`);
  return response.data;
};
