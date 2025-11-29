import httpClient from "./httpClient";
import { DeadlineItem } from "../types/domain";

export const getMyDeadlines = async (params?: { fromDate?: string; toDate?: string }): Promise<DeadlineItem[]> => {
  const response = await httpClient.get<{ items: DeadlineItem[] }>("/api/v1/deadlines/my", {
    params: {
      from_date: params?.fromDate,
      to_date: params?.toDate
    }
  });
  return response.data.items;
};
