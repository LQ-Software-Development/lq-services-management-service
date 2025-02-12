// DTOs para cada seção específica
export interface TeamMemberPerformanceDTO {
  developerId: string;
  completedTasks: number;
  averageCompletionTime: number;
  activeTasksCount: number;
  reviewApprovalRate: number;
  reopenedTasks: number;
  efficiencyRate: number;
  projectsInvolved: number;
}

export interface ProjectOverviewDTO {
  id: string;
  name: string;
  status: "NO_PRAZO" | "EM_RISCO" | "ATRASADO";
  completionPercentage: number;
  startDate: Date;
  deadline: Date;
  delayedTasks: number;
  blockedTasks: number;
}

export interface QualityMetricsDTO {
  approvalRate: number;
  reworkRate: number;
  averageReviewTime: number;
  criticalFeedbacks: {
    taskId: string;
    projectId: string;
    comment: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  }[];
}

export interface WorkloadDTO {
  totalBacklog: number;
  inProgress: number;
  teamCapacity: number;
  overloadAlert: boolean;
}

export interface TrendDataDTO {
  period: string;
  completedTasks: number;
  approvalRate: number;
  reworkRate: number;
  averageCompletionTime: number;
}

export interface RiskAlertDTO {
  type: "DELAY" | "QUALITY" | "CAPACITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  affectedItems: {
    id: string;
    type: "PROJECT" | "TASK" | "DEVELOPER";
    name: string;
  }[];
}

// DTO principal do dashboard
export interface ManagerDashboardDTO {
  teamPerformance: {
    members: TeamMemberPerformanceDTO[];
    totalCompletedTasks: number;
    averageTeamPerformance: number;
  };

  projects: {
    active: ProjectOverviewDTO[];
    delayedCount: number;
    atRiskCount: number;
  };

  quality: {
    overall: QualityMetricsDTO;
    byProject: Record<string, QualityMetricsDTO>;
  };

  workload: WorkloadDTO;

  trends: {
    daily: TrendDataDTO[];
    weekly: TrendDataDTO[];
    monthly: TrendDataDTO[];
  };

  risks: {
    critical: RiskAlertDTO[];
    warnings: RiskAlertDTO[];
  };

  filters?: {
    startDate?: Date;
    endDate?: Date;
    projectIds?: string[];
    developerIds?: string[];
  };
}
