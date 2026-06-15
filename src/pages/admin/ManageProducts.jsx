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

const SUBCATEGORIES = [
  { value: "computers_laptops", label: "Computers & Laptops" },
  { value: "phones", label: "Phones" },
  { value: "accessories", label: "Accessories" },
  { value: "routers", label: "Routers" },
];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "product",
    subCategory: "",
    brand: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingHasImage, setEditingHasImage] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "product", subCategory: "", brand: "" });
    setImageFile(null);
    setEditingId(null);
    setEditingHasImage(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (form.category === "product") {
      const hasImage = imageFile || (editingId && editingHasImage);
      if (!hasImage) {
        setFormError("An image is required for products.");
        return;
      }
      if (!form.subCategory) {
        setFormError("Please select a sub-category.");
        return;
      }
      if (!form.brand.trim()) {
        setFormError("Please enter a brand.");
        return;
      }
    }

    setUploading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const isProduct = form.category === "product";

      if (editingId) {
        const updateData = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          subCategory: isProduct ? form.subCategory : "",
          brand: isProduct ? form.brand.trim() : "",
        };
        if (imageUrl) updateData.imageUrl = imageUrl;
        await updateDoc(doc(db, "products", editingId), updateData);
      } else {
        await addDoc(collection(db, "products"), {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          subCategory: isProduct ? form.subCategory : "",
          brand: isProduct ? form.brand.trim() : "",
          imageUrl: imageUrl || "",
          status: "active",
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      setFormError("Error saving: " + err.message);
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
      subCategory: product.subCategory || "",
      brand: product.brand || "",
    });
    setEditingId(product.id);
    setEditingHasImage(!!product.imageUrl);
    setImageFile(null);
    setFormError("");
  };

  const toggleStatus = async (product) => {
    await updateDoc(doc(db, "products", product.id), {
      status: product.status === "active" ? "inactive" : "active",
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this item?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const imageRequired = form.category === "product";
  const isProductCategory = form.category === "product";

  const subCategoryLabel = (value) =>
    SUBCATEGORIES.find((s) => s.value === value)?.label || value;

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Manage Products</h1>

      <div style={formCardStyle}>
        <h3 style={formTitleStyle}>{editingId ? "Edit Item" : "Add New Item"}</h3>

        {formError && <p style={errorStyle}>{formError}</p>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
          />

          <div style={rowStyle}>
            <div style={colStyle}>
              <label style={labelStyle}>Price (Tsh)</label>
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
            <div style={colStyle}>
              <label style={labelStyle}>Type</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>

          {isProductCategory && (
            <div style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle}>Sub-category</label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select sub-category</option>
                  {SUBCATEGORIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div style={colStyle}>
                <label style={labelStyle}>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  placeholder="e.g. HP, Samsung, TP-Link"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <label style={labelStyle}>
            Image{" "}
            {imageRequired ? (
              <span style={{ color: "#ff6b6b" }}>(required)</span>
            ) : (
              <span style={{ color: "#666" }}>(optional)</span>
            )}
            {editingId && <span style={{ color: "#666" }}> — leave empty to keep current</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ ...inputStyle, padding: "10px" }}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={uploading} style={btnStyle}>
              {uploading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={cancelBtnStyle}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 style={{ ...formTitleStyle, marginTop: "40px" }}>All Items</h3>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Sub-category</th>
              <th style={thStyle}>Brand</th>
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
                    <img src={p.imageUrl} alt={p.name} style={thumbStyle} />
                  ) : (
                    <span style={{ color: "#666" }}>No image</span>
                  )}
                </td>
                <td style={tdStyle}>{p.name}</td>
                <td style={{ ...tdStyle, textTransform: "capitalize" }}>{p.category}</td>
                <td style={tdStyle}>{p.subCategory ? subCategoryLabel(p.subCategory) : "—"}</td>
                <td style={tdStyle}>{p.brand || "—"}</td>
                <td style={tdStyle}>Tsh {Number(p.price).toLocaleString()}</td>
                <td style={tdStyle}>
                  <span style={p.status === "active" ? statusActive : statusInactive}>
                    {p.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleEdit(p)} style={actionBtnStyle}>Edit</button>
                    <button onClick={() => toggleStatus(p)} style={actionBtnStyle}>
                      {p.status === "active" ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p style={{ color: "#9a9aae", padding: "20px" }}>No items yet.</p>}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const pageStyle = {
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#0d0d0f",
  color: "#fff",
  fontFamily: "'Segoe UI', sans-serif",
  padding: "40px 30px",
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "800",
  marginBottom: "30px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const formCardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "30px",
  maxWidth: "600px",
};

const formTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#fff",
};

const labelStyle = {
  display: "block",
  color: "#ccc",
  fontSize: "0.85rem",
  marginBottom: "6px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #2a2a3a",
  background: "#0d0d0f",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const rowStyle = {
  display: "flex",
  gap: "12px",
};

const colStyle = {
  flex: 1,
};

const btnStyle = {
  padding: "12px 28px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "0.95rem",
  cursor: "pointer",
};

const cancelBtnStyle = {
  padding: "12px 28px",
  borderRadius: "30px",
  border: "1px solid #2a2a3a",
  background: "transparent",
  color: "#ccc",
  fontWeight: "600",
  fontSize: "0.95rem",
  cursor: "pointer",
};

const errorStyle = {
  background: "#3a1a1a",
  color: "#ff6b6b",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "0.9rem",
  marginBottom: "16px",
  border: "1px solid #5a2a2a",
};

const tableWrapStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  overflow: "hidden",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "850px",
};

const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  borderBottom: "1px solid #2a2a3a",
  color: "#9a9aae",
  fontSize: "0.85rem",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #2a2a3a",
  color: "#eee",
  fontSize: "0.9rem",
};

const thumbStyle = {
  width: "45px",
  height: "45px",
  objectFit: "cover",
  borderRadius: "6px",
};

const statusActive = {
  background: "#1a3a1a",
  color: "#6bff6b",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.8rem",
  textTransform: "capitalize",
};

const statusInactive = {
  background: "#3a3a1a",
  color: "#ffd76b",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.8rem",
  textTransform: "capitalize",
};

const actionBtnStyle = {
  padding: "6px 14px",
  borderRadius: "6px",
  border: "1px solid #2a2a3a",
  background: "#0d0d0f",
  color: "#00c6ff",
  cursor: "pointer",
  fontSize: "0.8rem",
};

const deleteBtnStyle = {
  ...actionBtnStyle,
  color: "#ff6b6b",
};