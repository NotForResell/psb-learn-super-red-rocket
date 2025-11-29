import httpClient from "./httpClient";
import { Submission } from "../types/domain";

export const getMySubmissions = async (): Promise<Submission[]> => {
  const response = await httpClient.get<Submission[]>("/api/v1/submissions/my");
  return response.data;
};

export const submitWork = async (
  assignmentId: number,
  studentComment: string,
  files: File[]
): Promise<Submission> => {
  const formData = new FormData();
  formData.append("assignment_id", assignmentId.toString());
  formData.append("student_comment", studentComment);
  files.forEach((file) => formData.append("files", file));
  const response = await httpClient.post<Submission>("/api/v1/submissions", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const getSubmission = async (submissionId: number): Promise<Submission> => {
  const response = await httpClient.get<Submission>(`/api/v1/submissions/${submissionId}`);
  return response.data;
};

export const downloadSubmissionFile = (fileId: number) =>
  httpClient.get(`/api/v1/submissions/files/${fileId}/download`, { responseType: "blob" });

export const getMySubmissionsByAssignment = async (assignmentId: number): Promise<Submission[]> => {
  const response = await httpClient.get<{ items: Submission[] }>(
    `/api/v1/assignments/${assignmentId}/my-submissions`
  );
  return response.data.items;
};
