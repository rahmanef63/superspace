import type { Id } from "@convex/_generated/dataModel";
import { ensureTitle } from "../../shared";

interface CreateInput {
  title: string;
  isPublic: boolean;
  workspaceId: Id<"workspaces">;
  content?: string;
}

interface UpdateInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export class DocumentService {
  static async createDocument(
    createMutation: (input: CreateInput) => Promise<Id<"documents">>,
    data: CreateInput
  ) {
    return createMutation({
      ...data,
      title: ensureTitle(data.title),
    });
  }

  static async updateDocument(
    updateMutation: (input: { id: Id<"documents"> } & UpdateInput) => Promise<void>,
    id: Id<"documents">,
    data: UpdateInput
  ) {
    return updateMutation({ id, ...data });
  }

  static async deleteDocument(
    deleteMutation: (input: { id: Id<"documents"> }) => Promise<void>,
    id: Id<"documents">
  ) {
    return deleteMutation({ id });
  }
}
