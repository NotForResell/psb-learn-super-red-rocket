import httpClient from "./httpClient";
import { GradeItem } from "../types/domain";

export const getMyGrades = async (): Promise<GradeItem[]> => {
  const response = await httpClient.get<{ items: GradeItem[] }>("/api/v1/grades/my");
  return response.data.items;
};
