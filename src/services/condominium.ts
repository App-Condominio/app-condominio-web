import { DBService } from "./db";
import { Tables } from "@/constants";

export type TCondominuim = {
  name: string;
};

export const CondominiumService = {
  createOrUpdate: async (payload: TCondominuim, id: string) => {
    const newPayload = { ...payload, created_at: new Date().toISOString() };
    await DBService.upsert({
      table: Tables.Condominiums,
      id,
      payload: newPayload,
    });
  },
};
