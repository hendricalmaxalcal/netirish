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
import styles from "../css/ManageProducts.module.css";

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
      if (!hasImage) { setFormError("An image is required for products."); return; }
      if (!form.subCategory) { setFormError("Please select a sub-category."); return; }
      if (!form.brand.trim()) { setFormError("Please enter a brand."); return; }
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

  const subCategoryLabel = (value) =>
    SUBCATEGORIES.find((s) => s.value === value)?.label || value;

  const isProduct = form.category === "product";

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Manage Products</h1>

      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>{editingId ? "Edit Item" : "Add New Item"}</h3>

        {formError && <p className={styles.error}>{formError}</p>}

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className={styles.textarea}
          />

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>Price (Tsh)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={styles.input}
              />
            </div>
            <div className={styles.col}>
              <label className={styles.label}>Type</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={styles.input}
                style={{ cursor: "pointer" }}
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>

          {isProduct && (
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>Sub-category</label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select sub-category</option>
                  {SUBCATEGORIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.col}>
                <label className={styles.label}>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  placeholder="e.g. HP, Samsung, TP-Link"
                  className={styles.input}
                />
              </div>
            </div>
          )}

          <label className={styles.label}>
            Image{" "}
            {isProduct ? (
              <span className={styles.requiredMark}>(required)</span>
            ) : (
              <span className={styles.optionalMark}>(optional)</span>
            )}
            {editingId && (
              <span className={styles.optionalMark}> — leave empty to keep current</span>
            )}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className={styles.input}
            style={{ padding: "10px" }}
          />

          <div className={styles.formActions}>
            <button type="submit" disabled={uploading} className={styles.btn}>
              {uploading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>All Items</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Image</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Sub-category</th>
                <th className={styles.th}>Brand</th>
                <th className={styles.th}>Price</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className={styles.td}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className={styles.thumb} />
                    ) : (
                      <span className={styles.noImage}>No image</span>
                    )}
                  </td>
                  <td className={styles.td}>{p.name}</td>
                  <td className={styles.td}>{p.category}</td>
                  <td className={styles.td}>
                    {p.subCategory ? subCategoryLabel(p.subCategory) : "—"}
                  </td>
                  <td className={styles.td}>{p.brand || "—"}</td>
                  <td className={styles.td}>Tsh {Number(p.price).toLocaleString()}</td>
                  <td className={styles.td}>
                    <span className={p.status === "active" ? styles.statusActive : styles.statusInactive}>
                      {p.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.tableActions}>
                      <button onClick={() => handleEdit(p)} className={styles.actionBtn}>Edit</button>
                      <button onClick={() => toggleStatus(p)} className={styles.actionBtn}>
                        {p.status === "active" ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className={styles.emptyText}>No items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}