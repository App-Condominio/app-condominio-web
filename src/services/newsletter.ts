import { uploadFile } from "@/utils/uploadFile";
import { where } from "firebase/firestore";
import { DBService } from "./db";
import { Tables } from "@/constants";

export type TNewsletter = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  condominium_id: string;
  created_at: string;
};

export const NewsletterService = {
  create: async (
    condominium_id: string,
    file: File | null,
    newsletter: { title: string; description: string }
  ) => {
    let payload: Omit<TNewsletter, "id"> = {
      title: newsletter.title,
      description: newsletter.description,
      image_url: null,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    if (file) {
      const image_url = await uploadFile(`${condominium_id}/images`, file);
      payload = { ...payload, image_url };
    }

    await DBService.create({ table: Tables.Newsletter, payload });
    return payload;
  },

  list: async (condominium_id: string) => {
    const newsletters = await DBService.readAll({
      table: Tables.Newsletter,
      queries: [where("condominium_id", "==", condominium_id)],
    });

    return newsletters as TNewsletter[];
  },
};
