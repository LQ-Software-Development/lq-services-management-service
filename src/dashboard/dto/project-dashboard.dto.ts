export interface ProjectHeaderDTO {
  name: string;
  status: "NO_PRAZO" | "EM_RISCO" | "ATRASADO";
  startDate: Date;
  deadline: Date;
  completionPercentage: number;
  approvalRate: number;
  totalTasks: number;
  completedTasks: number;
}

export interface TaskTimelineDTO {
  id: string;
  title: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  completionPercentage: number;
}

export interface TaskDistributionDTO {
  status: string;
  count: number;
  blockedCount?: number;
}

export interface TimeComparisonDTO {
  taskId: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  variance: number;
}

export interface ProjectRiskDTO {
  type: "DELAY" | "QUALITY" | "RESOURCE";
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  affectedTasks: string[];
}

export interface ProjectTrendDTO {
  date: string;
  completedTasks: number;
  timeSpent: number;
  approvalRate: number;
}

export interface ProjectDashboardDTO {
  header: ProjectHeaderDTO;
  timeline: TaskTimelineDTO[];
  taskDistribution: TaskDistributionDTO[];
  timeComparison: TimeComparisonDTO[];
  risks: ProjectRiskDTO[];
  trends: ProjectTrendDTO[];
  filters?: {
    startDate?: Date;
    endDate?: Date;
    taskStatus?: string[];
  };
}
