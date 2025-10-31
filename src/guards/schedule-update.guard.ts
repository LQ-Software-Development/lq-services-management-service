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

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId =
        payload.userId ||
        payload.sub ||
        payload.sub?.userId ||
        payload.accesses[0]?.id;
      request["user"] = {
        userId,
      };
    } catch {
      throw new UnauthorizedException();
    }

    console.log(payload);

    const userIdentifiers = [
      request["user"]?.userId,
      payload.sub,
      payload.sub?.userId,
      payload.accesses?.[0]?.id,
    ].filter(Boolean);

    if (!userIdentifiers.includes(schedule.assignedId)) {
      throw new ForbiddenException("User is not the owner of this resource");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
