export class Task {
  id: number;
  name: string;
  detail?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
