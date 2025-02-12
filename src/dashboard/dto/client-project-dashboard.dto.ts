export interface ClientProjectHeaderDTO {
  name: string;
  status: "NO_PRAZO" | "EM_RISCO" | "ATRASADO";
  startDate: Date;
  deadline: Date;
  completionPercentage: number;
  lastUpdate: Date;
  nextDeliveryDate?: Date;
}

export interface ClientDeliverableDTO {
  id: string;
  title: string;
  dueDate: Date;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED";
  approvalStatus: "APPROVED" | "IN_REVIEW" | "PENDING";
  comments?: string[];
  completionPercentage: number;
}

export interface ClientRiskDTO {
  type: "DELAY" | "SCOPE" | "QUALITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  impact: string;
  mitigation?: string;
}

export interface ClientCommunicationDTO {
  date: Date;
  type: "UPDATE" | "ALERT" | "FEEDBACK";
  message: string;
  from: string;
  requiresAction: boolean;
}

export interface ClientNextStepsDTO {
  date: Date;
  type: "MEETING" | "DELIVERY" | "REVIEW";
  description: string;
  participants?: string[];
}

export interface ClientProjectDashboardDTO {
  header: ClientProjectHeaderDTO;
  deliverables: ClientDeliverableDTO[];
  risks: ClientRiskDTO[];
  communication: ClientCommunicationDTO[];
  nextSteps: ClientNextStepsDTO[];
  filters?: {
    startDate?: Date;
    endDate?: Date;
    showCompleted?: boolean;
  };
}
