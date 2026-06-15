import { useEffect, useState } from "react";
import { db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "product",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "product" });
    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editingId) {
        // Update existing product
        const updateData = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
        };
        if (imageUrl) updateData.imageUrl = imageUrl;

        await updateDoc(doc(db, "products", editingId), updateData);
      } else {
        // Create new product
        await addDoc(collection(db, "products"), {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          imageUrl: imageUrl || "",
          status: "active",
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error saving product: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
    setEditingId(product.id);
  };

  const toggleStatus = async (product) => {
    await updateDoc(doc(db, "products", product.id), {
      status: product.status === "active" ? "inactive" : "active",
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Manage Products</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", marginBottom: "30px" }}>
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>

        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            style={inputStyle}
          />
        </div>

        <div>
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label>Image {editingId && "(leave empty to keep current)"}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={uploading} style={{ padding: "10px 20px", marginTop: "10px" }}>
          {uploading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={{ padding: "10px 20px", marginLeft: "10px" }}>
            Cancel
          </button>
        )}
      </form>

      <h3>All Products</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Image</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={tdStyle}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} width="50" />
                ) : (
                  "No image"
                )}
              </td>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.category}</td>
              <td style={tdStyle}>${p.price}</td>
              <td style={tdStyle}>{p.status}</td>
              <td style={tdStyle}>
                <button onClick={() => handleEdit(p)}>Edit</button>{" "}
                <button onClick={() => toggleStatus(p)}>
                  {p.status === "active" ? "Hide" : "Show"}
                </button>{" "}
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  marginTop: "5px",
};

const thStyle = {
  borderBottom: "2px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};