import httpClient from "./httpClient";
import { Course, CourseDetail, CourseStructureResponse } from "../types/domain";

export const getStudentCourses = async (): Promise<{ enrolled: Course[]; available: Course[] }> => {
  const response = await httpClient.get<{ enrolled: Course[]; available: Course[] }>("/api/v1/courses");
  return response.data;
};

export const enrollCourse = async (courseId: number): Promise<Course> => {
  const response = await httpClient.post<Course>(`/api/v1/courses/${courseId}/enroll`);
  return response.data;
};

export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  const response = await httpClient.get<CourseDetail>(`/api/v1/courses/${courseId}`);
  return response.data;
};

export const getCourseStructure = async (courseId: number): Promise<CourseStructureResponse> => {
  const response = await httpClient.get<CourseStructureResponse>(`/api/v1/courses/${courseId}/structure`);
  return response.data;
};
