import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getTestDetails, getMyTestAttempts, submitTest } from "../api/testsApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { TestAttemptResult, TestDetails } from "../types/domain";

const TestPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<TestDetails | null>(null);
  const [attempts, setAttempts] = useState<TestAttemptResult[]>([]);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      setLoading(true);
      const [testResp, attemptsResp] = await Promise.all([
        getTestDetails(Number(testId)),
        getMyTestAttempts(Number(testId))
      ]);
      setTest(testResp);
      setAttempts(attemptsResp);
      setLoading(false);
    };
    load();
  }, [testId]);

  const handleSingleChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  };

  const handleMultipleChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const current = new Set(prev[questionId] || []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
      return { ...prev, [questionId]: Array.from(current) };
    });
  };

  const handleSubmit = async () => {
    if (!testId) return;
    const payload = {
      answers: Object.entries(answers).map(([questionId, optionIds]) => ({
        questionId: Number(questionId),
        selectedOptionIds: optionIds
      }))
    };
    const resp = await submitTest(Number(testId), payload);
    setResult({ score: resp.score, maxScore: resp.maxScore });
    const attemptsResp = await getMyTestAttempts(Number(testId));
    setAttempts(attemptsResp);
  };

  if (loading || !test) return <LoadingSpinner label="Загружаем тест..." />;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Тест: {test.title}</Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Попытки
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Начало</TableCell>
                <TableCell>Результат</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.startedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {a.score !== null && a.maxScore !== null ? `${a.score} / ${a.maxScore}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Вопросы
          </Typography>
          <Stack spacing={3}>
            {test.questions.map((q, index) => (
              <Box key={q.id}>
                <Typography variant="subtitle1">Вопрос {index + 1}</Typography>
                <Typography variant="body2" mb={1}>
                  {q.text}
                </Typography>
                {q.type === "single" ? (
                  <RadioGroup
                    value={(answers[q.id] || [])[0] ?? ""}
                    onChange={(e) => handleSingleChange(q.id, Number(e.target.value))}
                  >
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt.id}
                        value={opt.id}
                        control={<Radio />}
                        label={opt.text}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <FormGroup>
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt.id}
                        control={
                          <Checkbox
                            checked={(answers[q.id] || []).includes(opt.id)}
                            onChange={() => handleMultipleChange(q.id, opt.id)}
                          />
                        }
                        label={opt.text}
                      />
                    ))}
                  </FormGroup>
                )}
              </Box>
            ))}
          </Stack>
          <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
            Отправить ответы
          </Button>
          {result && (
            <Typography variant="subtitle1" mt={2}>
              Результат: {result.score} / {result.maxScore}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default TestPage;


