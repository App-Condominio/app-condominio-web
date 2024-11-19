import { uploadFile } from "@/utils/uploadFile";
import { where } from "firebase/firestore";
import { DBService } from "./db";

export type TCondominuim = {
  name: string;
};

export type TFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  condominium_id: string;
  created_at: string;
};

export type TNewsletter = {
  id: string;
  title: string;
  description: string;
  url: string;
  condominium_id: string;
  created_at: string;
};

export const CondominiumService = {
  createOrUpdate: async (payload: TCondominuim, id: string) => {
    await DBService.upsert({ table: "condominiums", id, payload });
  },

  createNewsletter: async (
    condominium_id: string,
    file: File,
    newsletter: { title: string; description: string }
  ) => {
    const url = await uploadFile(`${condominium_id}/images`, file);

    const payload: Omit<TNewsletter, "id"> = {
      ...newsletter,
      url,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    await DBService.create({ table: "newsletter", payload });
  },

  listNewsletters: async (condominium_id: string) => {
    const newsletters = await DBService.readAll({
      table: "newsletter",
      q: where("condominium_id", "==", condominium_id),
    });

    return newsletters as TNewsletter[];
  },

  createFile: async (condominium_id: string, file: File) => {
    const url = await uploadFile(`${condominium_id}/files`, file);

    const payload: Omit<TFile, "id"> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    await DBService.create({ table: "files", payload });
  },

  listFiles: async (condominium_id: string) => {
    const files = await DBService.readAll({
      table: "files",
      q: where("condominium_id", "==", condominium_id),
    });

    return files as TFile[];
  },
};
