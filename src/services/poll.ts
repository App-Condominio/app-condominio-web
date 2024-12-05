import { DBService } from "./db";
import { Tables } from "@/constants";
import { formatDate } from "@/utils/formatDate";
import { Timestamp, where } from "firebase/firestore";

export type TPoll = {
  id?: string;
  condominium_id: string;
  title: string;
  description: string;
  options: { id: string; text: string; votes?: number }[];
  created_at?: string;
  expires_at?: string;
  is_active?: boolean;
};

export const PollService = {
  create: async ({
    condominium_id,
    title,
    description,
    options,
    expires_at,
  }: TPoll) => {
    const payload: Omit<TPoll, "id"> = {
      condominium_id,
      title,
      description,
      options,
      created_at: new Date().toISOString(),
      expires_at,
      is_active: true,
    };

    return await DBService.create({ table: Tables.Polls, payload });
  },

  listActive: async (condominium_id: string) => {
    const polls = await DBService.readAll({
      table: Tables.Polls,
      queries: [
        where("condominium_id", "==", condominium_id),
        where("is_active", "==", true),
        where("expires_at", ">", formatDate(new Date())),
      ],
    });

    return polls as TPoll[];
  },

  update: async (pollId: string, updates: Partial<TPoll>) => {
    await DBService.update({
      table: Tables.Polls,
      id: pollId,
      payload: updates,
    });
  },

  delete: async (pollId: string) => {
    await DBService.delete({ table: Tables.Polls, id: pollId });
  },

  expirePolls: async () => {
    const now = Timestamp.now();
    const expiredPolls = await DBService.readAll({
      table: Tables.Polls,
      queries: [where("expires_at", "<=", now.toDate().toISOString())],
    });

    const updatePromises = expiredPolls.map((poll) =>
      DBService.update({
        table: Tables.Polls,
        id: poll.id,
        payload: { is_active: false },
      })
    );

    return Promise.all(updatePromises);
  },
};
