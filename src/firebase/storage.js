// firebase/storage.js
import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, `${path}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};