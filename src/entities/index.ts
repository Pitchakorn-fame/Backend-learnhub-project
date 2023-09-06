import { Request } from "express";

export interface ICreateUser {
  username: string;
  name: string;
  password: string;
}

export interface IUser extends ICreateUser {
  id: string;
  registeredAt: Date;
}

export interface AppRequest<Params, Body> extends Request<Params, any, Body> {}

export interface Empty {}

export interface Withuser {
  username: string;
  name: string;
  password: string;
}

export interface ICreateContent {
  videoUrl: string;
  comment: string;
  rating: number;
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
  userId: string;
}

export interface IContent extends ICreateContent {
  id: number;
}

export interface IUpdateContent {
  comment: string;
  rating: number;
}

export interface WithContent {
  videoUrl: string;
  comment: string;
  rating: number;
}

export interface WithContentId {
  id: string;
}

export interface WithContentUpdate {
  comment: string;
  rating: number;
}
