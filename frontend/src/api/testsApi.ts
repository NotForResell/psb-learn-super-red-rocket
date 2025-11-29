import httpClient from "./httpClient";
import {
  TestSummary,
  TestDetails,
  TestQuestion,
  TestOption,
  TestAttemptResult
} from "../types/domain";

const mapOption = (o: any): TestOption => ({
  id: o.id,
  text: o.text
});

const mapQuestion = (q: any): TestQuestion => ({
  id: q.id,
  text: q.text,
  type: q.type,
  orderIndex: q.order_index,
  options: (q.options || []).map(mapOption)
});

export const getTestsByCourse = async (courseId: number): Promise<TestSummary[]> => {
  const response = await httpClient.get<{ items: any[] }>(`/api/v1/courses/${courseId}/tests`);
  return response.data.items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    timeLimitMinutes: item.time_limit_minutes
  }));
};

export const getTestDetails = async (testId: number): Promise<TestDetails> => {
  const response = await httpClient.get<any>(`/api/v1/tests/${testId}`);
  const data = response.data;
  return {
    id: data.id,
    courseId: data.course_id,
    title: data.title,
    description: data.description,
    timeLimitMinutes: data.time_limit_minutes,
    questions: (data.questions || []).map(mapQuestion)
  };
};

export const getMyTestAttempts = async (testId: number): Promise<TestAttemptResult[]> => {
  const response = await httpClient.get<{ items: any[] }>(`/api/v1/tests/${testId}/attempts/my`);
  return response.data.items.map((item) => ({
    id: item.id,
    testId: item.test_id,
    studentId: item.student_id,
    startedAt: item.started_at,
    finishedAt: item.finished_at,
    score: item.score,
    maxScore: item.max_score
  }));
};

export const submitTest = async (
  testId: number,
  payload: { answers: { questionId: number; selectedOptionIds: number[] }[] }
): Promise<{ attemptId: number; score: number; maxScore: number }> => {
  const body = {
    answers: payload.answers.map((a) => ({
      question_id: a.questionId,
      selected_option_ids: a.selectedOptionIds
    }))
  };
  const response = await httpClient.post(`/api/v1/tests/${testId}/submit`, body);
  return {
    attemptId: response.data.attempt_id,
    score: response.data.score,
    maxScore: response.data.max_score
  };
};
