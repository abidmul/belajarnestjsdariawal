export class Task {
  id: number;
  userId: number;
  name: string;
  detail?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
