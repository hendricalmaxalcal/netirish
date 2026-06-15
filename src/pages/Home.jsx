import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ProductCard from "../components/common/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "products"), where("status", "==", "active"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>Welcome to NetIrish</h1>
        <p style={heroSubtitleStyle}>
          Quality products and services, delivered with excellence.
        </p>
        <a href="#products" style={heroBtnStyle}>Shop Now</a>
      </section>

      <section id="products" style={productsSectionStyle}>
        <h2 style={sectionTitleStyle}>Our Offerings</h2>

        <div style={filterRowStyle}>
          <button onClick={() => setFilter("all")} style={filterBtn(filter === "all")}>All</button>
          <button onClick={() => setFilter("product")} style={filterBtn(filter === "product")}>Products</button>
          <button onClick={() => setFilter("service")} style={filterBtn(filter === "service")}>Services</button>
        </div>

        {loading ? (
          <p style={mutedTextStyle}>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={mutedTextStyle}>No items available right now.</p>
        ) : (
          <div style={gridStyle}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const pageStyle = {
  backgroundColor: "#0d0d0f",
  color: "#f5f5f5",
  minHeight: "100vh",
  fontFamily: "'Segoe UI', sans-serif",
};

const heroStyle = {
  textAlign: "center",
  padding: "100px 20px",
  background: "linear-gradient(135deg, #1a1a2e, #16213e)",
  borderBottom: "1px solid #2a2a3a",
};

const heroTitleStyle = {
  fontSize: "3rem",
  fontWeight: "800",
  margin: "0 0 15px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heroSubtitleStyle = {
  fontSize: "1.2rem",
  color: "#b0b0c0",
  marginBottom: "30px",
};

const heroBtnStyle = {
  display: "inline-block",
  padding: "14px 32px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  color: "#fff",
  borderRadius: "30px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "1rem",
};

const productsSectionStyle = {
  padding: "60px 30px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionTitleStyle = {
  fontSize: "2rem",
  marginBottom: "20px",
  textAlign: "center",
};

const filterRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "40px",
};

const filterBtn = (active) => ({
  padding: "10px 22px",
  borderRadius: "20px",
  border: "1px solid #444",
  background: active ? "linear-gradient(90deg, #00c6ff, #7b2ff7)" : "transparent",
  color: active ? "#fff" : "#ccc",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
});

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
  justifyContent: "center",
};

const mutedTextStyle = {
  textAlign: "center",
  color: "#888",
};