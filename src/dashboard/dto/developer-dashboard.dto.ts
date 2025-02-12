export interface AssignedTaskDetailedDTO {
  id: string;
  title: string;
  status: string;
  value: number;
  dueDate: Date;
  priority: "LOW" | "MEDIUM" | "HIGH";
  startDate: Date;
  endDate: Date;
  estimatedTime: number;
}

export interface TimeLogDetailedDTO {
  id: string;
  totalMinutes: number;
  startTime: Date;
  endTime: Date;
  taskId: string;
  taskTitle: string;
}

export interface ProductivityHistoryDTO {
  period: string;
  completedTasks: number;
  averageCompletionTime: number;
  workingHours: number;
}

export interface ProductivityIndicatorsDTO {
  totalAssigned: number;
  totalCompleted: number;
  averageCompletionTime: number;
  wipCount: number;
}

export interface FeedbackDTO {
  taskId: string;
  comment: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface TaskStatusHistoryDTO {
  taskId: string;
  oldStatus: string;
  newStatus: string;
  changedAt: Date;
}

export interface DeveloperDashboardDTO {
  assignedTasks: AssignedTaskDetailedDTO[];
  completedTasks: AssignedTaskDetailedDTO[];
  averageCompletionTime: number;
  wipCount: number;
  workHistory: TimeLogDetailedDTO[];
  feedback: FeedbackDTO[];
  productivityIndicators: ProductivityIndicatorsDTO;
  productivityHistory: ProductivityHistoryDTO[];
  taskStatusHistory: TaskStatusHistoryDTO[];
  filters?: {
    startDate?: Date;
    endDate?: Date;
    period?: "daily" | "weekly" | "monthly";
  };
}
