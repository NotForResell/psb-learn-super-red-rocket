import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { getCourseMessages, postCourseMessage } from "../api/chatApi";
import { ChatMessage } from "../types/domain";

interface Props {
  courseId: number;
}

const CourseChatTab = ({ courseId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    const resp = await getCourseMessages(courseId);
    setMessages(resp);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 15000);
    return () => clearInterval(timer);
  }, [courseId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const newMsg = await postCourseMessage(courseId, text.trim());
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setSending(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Обсуждение курса</Typography>
        <Button variant="outlined" size="small" onClick={loadMessages}>
          Обновить
        </Button>
      </Stack>
      <Box
        sx={{
          maxHeight: 360,
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          bgcolor: "background.paper"
        }}
      >
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} alignItems="flex-start" divider>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">{msg.authorName}</Typography>
                    {msg.isTeacher && <Chip label="Преподаватель" size="small" color="secondary" />}
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{msg.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
        <div ref={bottomRef} />
      </Box>
      <Divider />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          fullWidth
          label="Сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          minRows={2}
        />
        <Button variant="contained" onClick={handleSend} disabled={sending} sx={{ minWidth: 140 }}>
          Отправить
        </Button>
      </Stack>
    </Stack>
  );
};

export default CourseChatTab;
