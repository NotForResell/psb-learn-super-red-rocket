import httpClient from "./httpClient";
import { FeedItem } from "../types/domain";

export const getMyFeed = async (limit?: number): Promise<FeedItem[]> => {
  const response = await httpClient.get<{ items: FeedItem[] }>("/api/v1/feed/my", {
    params: { limit }
  });
  return response.data.items;
};
