import { Response } from "express";
import {
  AppRequest,
  Empty,
  WithContent,
  WithContentId,
  WithContentUpdate,
  Withuser,
} from "../entities";
import { JwtAuthRequest } from "../auth/jwt";

export type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

export interface IHandlerUser {
  register: HandlerFunc<AppRequest<Empty, Withuser>>;
  login: HandlerFunc<AppRequest<Empty, Withuser>>;
  logout: HandlerFunc<JwtAuthRequest<Empty, Empty>>;
}

export interface IHandlerContent {
  createContent: HandlerFunc<JwtAuthRequest<Empty, WithContent>>;
  getContents(_, res: Response): Promise<Response>;
  getContent: HandlerFunc<JwtAuthRequest<WithContentId, Empty>>;
  updateContent: HandlerFunc<JwtAuthRequest<WithContentId, WithContentUpdate>>;
  deleteContent: HandlerFunc<JwtAuthRequest<WithContentId, Empty>>;
}
