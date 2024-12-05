import { DBService } from "./db";
import { Tables } from "@/constants";

export type TCondominuim = {
  name: string;
};

export const CondominiumService = {
  createOrUpdate: async (condominium: TCondominuim, id: string) => {
    const payload = {
      name: condominium.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await DBService.upsert({ table: Tables.Condominiums, id, payload });
  },
};
