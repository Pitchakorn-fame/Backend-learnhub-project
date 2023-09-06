import { Response } from "express";
import { JwtAuthRequest } from "../auth/jwt";
import {
  Empty,
  WithContent,
  WithContentId,
  WithContentUpdate,
} from "../entities";
import { IRepositoryContent } from "../repositories";
import { getVideoDetails } from "../domain/services/oembed";
import { IHandlerContent } from ".";

export function newHandlerContent(
  repoContent: IRepositoryContent
): IHandlerContent {
  return new HandlerContent(repoContent);
}

class HandlerContent implements IHandlerContent {
  repoContent: IRepositoryContent;

  constructor(repoContent: IRepositoryContent) {
    this.repoContent = repoContent;
  }

  async createContent(
    req: JwtAuthRequest<Empty, WithContent>,
    res: Response
  ): Promise<Response> {
    const content: WithContent = req.body;

    if (!content.comment || !content.rating || !content.videoUrl) {
      return res
        .status(400)
        .json({ error: "missing information", statusCode: 400 })
        .end();
    }

    const userId = req.payload.id;
    const details = await getVideoDetails(content.videoUrl);

    return this.repoContent
      .createContent({ ...content, ...details, userId })
      .then((content) => res.status(201).json(content).end())
      .catch((err) => {
        console.error(`failed to create content: ${err}`);
        return res
          .status(500)
          .json({ error: `failed to create content: ${err}`, statusCode: 500 })
          .end();
      });
  }

  async getContents(_, res: Response): Promise<Response> {
    return this.repoContent
      .getContents()
      .then((contents) => res.status(201).json({ data: contents }).end())
      .catch((err) => {
        console.error(`failed to get contents: ${err}`);
        return res
          .status(500)
          .json({ error: `failed to get contents : ${err}`, statusCode: 500 })
          .end();
      });
  }

  async getContent(
    req: JwtAuthRequest<WithContentId, Empty>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${id} is not a number`, statusCode: 400 })
        .end();
    }

    return this.repoContent
      .getContent(id)
      .then((content) => {
        if (!content) {
          return res
            .status(404)
            .json({ error: `no such content: ${id}`, statusCode: 404 })
            .end();
        }
        return res.status(201).json(content).end();
      })
      .catch((err) => {
        console.error(`failed to get content ${id}: ${err}`);
        return res
          .status(500)
          .json({
            error: `failed to get content ${id}: ${err}`,
            statusCode: 500,
          })
          .end();
      });
  }

  async updateContent(
    req: JwtAuthRequest<WithContentId, WithContentUpdate>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);
    const content: WithContentUpdate = req.body;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${id} is not a number`, statusCode: 400 })
        .end();
    }

    if (!content.comment || !content.rating) {
      return res
        .status(400)
        .json({ error: "missing information", statusCode: 400 })
        .end();
    }

    return this.repoContent
      .updateContent(id, { ...content })
      .then((updated) => res.status(201).json(updated).end())
      .catch((err) => {
        console.error(`failed to update content ${id}: ${err}`);
        return res
          .status(500)
          .json({
            error: `failed to update content ${id}: ${err}`,
            statusCode: 500,
          })
          .end();
      });
  }

  async deleteContent(
    req: JwtAuthRequest<WithContentId, Empty>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${id} is not a number`, statusCode: 400 })
        .end();
    }

    return this.repoContent
      .deleteContent(id)
      .then((deleted) => res.status(200).json(deleted).end())
      .catch((err) => {
        console.error(`failed to delete content ${id}: ${err}`);
        return res
          .status(500)
          .json({
            error: `failed to delete content ${id}: ${err}`,
            statusCode: 500,
          })
          .end();
      });
  }
}
