import { useState } from "react";
import { db, storage } from "../../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProductForm() {
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "product" });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = "";
    if (imageFile) {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "products"), {
      ...form,
      price: Number(form.price),
      imageUrl,
      status: "active",
      createdAt: serverTimestamp(),
    });

    setForm({ name: "", description: "", price: "", category: "product" });
    setImageFile(null);
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        <option value="product">Product</option>
        <option value="service">Service</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Add Product"}
      </button>
    </form>
  );
}