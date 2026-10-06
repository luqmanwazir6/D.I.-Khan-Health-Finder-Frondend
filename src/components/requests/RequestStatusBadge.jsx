import Badge from '@/components/common/Badge';
import { getRequestStatusMeta } from '@/constants/requestStatus';

export default function RequestStatusBadge({ status, size = 'md' }) {
  const meta = getRequestStatusMeta(status);
  return (
    <Badge tone={meta.tone} size={size}>
      {meta.label}
    </Badge>
  );
}
