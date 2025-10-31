import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Schedule } from "../models/schedule.entity";

@Injectable()
export class ScheduleUpdateGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const id = request.params.id;

    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new ForbiddenException("Schedule not found");
    }

    if (schedule.status !== "in-progress") {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log(payload);
      request["user"] = {
        userId: payload["userId"],
        participantId: payload["participantId"],
      };
    } catch {
      throw new UnauthorizedException();
    }

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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
