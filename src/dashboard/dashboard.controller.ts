import { Controller, Get, Param, Headers, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProjectDashboardService } from "./services/project-dashboard.service";
import { DeveloperDashboardService } from "./services/developer-dashboard.service";
import { ManagerDashboardService } from "./services/manager-dashboard.service";
import { GlobalDashboardService } from "./services/global-dashboard.service";
import { ClientProjectDashboardService } from "./services/client-project-dashboard.service";

@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly projectDashboardService: ProjectDashboardService,
    private readonly developerDashboardService: DeveloperDashboardService,
    private readonly managerDashboardService: ManagerDashboardService,
    private readonly globalDashboardService: GlobalDashboardService,
    private readonly clientProjectDashboardService: ClientProjectDashboardService,
  ) {}

  // Dashboard do Projeto
  @Get("project/:projectId")
  async getProjectDashboard(@Param("projectId") projectId: string) {
    return await this.projectDashboardService.getDashboard(projectId);
  }

  // Dashboard do Desenvolvedor
  @Get("developer/:developerId")
  async getDeveloperDashboard(@Param("developerId") developerId: string) {
    return await this.developerDashboardService.getDashboard(developerId);
  }

  // Dashboard do Gestor de Projetos
  @Get("manager")
  async getManagerDashboard(
    @Headers("organization-id") organizationId: string,
  ) {
    return await this.managerDashboardService.getDashboard(organizationId);
  }

  // Dashboard Global (Qualidade e Eficiência)
  @Get("global")
  async getGlobalDashboard(@Headers("organization-id") organizationId: string) {
    return await this.globalDashboardService.getDashboard(organizationId);
  }

  @Get("client-project/:projectId")
  async getClientProjectDashboard(
    @Param("projectId") projectId: string,
    @Query()
    filters?: {
      startDate?: Date;
      endDate?: Date;
      showCompleted?: boolean;
    },
  ) {
    return await this.clientProjectDashboardService.getDashboard(
      projectId,
      filters,
    );
  }
}
