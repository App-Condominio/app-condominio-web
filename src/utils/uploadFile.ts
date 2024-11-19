import { storage } from "@/config/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadFile = async (path: string, file: File) => {
  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
