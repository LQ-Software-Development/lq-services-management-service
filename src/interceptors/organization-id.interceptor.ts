import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class OrganizationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Ignora a verificação de organizationId para PUT /schedules/:id
    const isScheduleUpdateRoute =
      request.method === "PUT" && /^\/schedules\/[^/]+$/.test(request.path);

    if (isScheduleUpdateRoute) {
      return next.handle();
    }

    const organizationId = request.headers["organization-id"];

    // Adiciona o organizationId ao request para uso posterior
    request.organizationId = organizationId;

    return next.handle();
  }
}
