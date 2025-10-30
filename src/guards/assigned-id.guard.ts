import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AssignedIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const participantId = request["user"]?.participantId;
    const assignedId = request.body?.assignedId;

    if (!participantId || !assignedId) {
      throw new ForbiddenException("Missing participantId or assignedId");
    }

    if (participantId !== assignedId) {
      throw new ForbiddenException("User is not the owner of this resource");
    }

    return true;
  }
}
