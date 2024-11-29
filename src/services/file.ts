import { uploadFile } from "@/utils/uploadFile";
import { where } from "firebase/firestore";
import { DBService } from "./db";
import { Tables } from "@/constants";

export type TFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  condominium_id: string;
  created_at: string;
};

export const FileService = {
  create: async (condominium_id: string, file: File) => {
    const url = await uploadFile(`${condominium_id}/files`, file);

    const payload: Omit<TFile, "id"> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    await DBService.create({ table: Tables.Files, payload });
  },

  list: async (condominium_id: string) => {
    const files = await DBService.readAll({
      table: Tables.Files,
      queries: [where("condominium_id", "==", condominium_id)],
    });

    return files as TFile[];
  },
};
