import { storage } from "@/config/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Path = `${string}/images` | `${string}/files`;

export const uploadFile = async (path: Path, file: File) => {
  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
