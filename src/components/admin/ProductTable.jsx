import { db } from "../../firebase/config";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ProductTable({ products }) {
  const toggleStatus = (product) => {
    updateDoc(doc(db, "products", product.id), {
      status: product.status === "active" ? "inactive" : "active",
    });
  };

  const remove = (id) => {
    if (confirm("Delete this product?")) deleteDoc(doc(db, "products", id));
  };

  return (
    <table>
      <thead>
        <tr><th>Image</th><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id}>
            <td><img src={p.imageUrl} alt={p.name} width="50" /></td>
            <td>{p.name}</td>
            <td>${p.price}</td>
            <td>{p.status}</td>
            <td>
              <button onClick={() => toggleStatus(p)}>
                {p.status === "active" ? "Hide" : "Show"}
              </button>
              <button onClick={() => remove(p.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}