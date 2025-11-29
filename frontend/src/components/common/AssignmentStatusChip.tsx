import { Chip } from "@mui/material";
import { SubmissionStatus } from "../../types/domain";

interface Props {
  status: SubmissionStatus;
}

const statusMap: Record<SubmissionStatus, { label: string; color: "default" | "warning" | "success" | "info" }> = {
  draft: { label: "Черновик", color: "default" },
  submitted: { label: "Отправлено", color: "warning" },
  checked: { label: "Проверено", color: "success" }
};

const AssignmentStatusChip = ({ status }: Props) => {
  const info = statusMap[status];
  return <Chip label={info.label} color={info.color} size="small" />;
};

export default AssignmentStatusChip;
