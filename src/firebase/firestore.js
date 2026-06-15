// firestore.js
import { db } from "./config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export const addItem = (col, data) => addDoc(collection(db, col), data);
export const getItems = async (col) => {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const updateItem = (col, id, data) => updateDoc(doc(db, col, id), data);
export const deleteItem = (col, id) => deleteDoc(doc(db, col, id));