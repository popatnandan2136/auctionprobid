import React, { useState, useEffect } from "react";
import API from "../api";

export default function CategoryTest({ addLog }) {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
      addLog("FETCH CATEGORIES", res.data);
    } catch (err) {
      addLog("FETCH CATEGORIES ERROR", err.response?.data);
    }
  };

  const addCategory = async () => {
    try {
      const res = await API.post("/category", { name: categoryName });
      addLog("ADD CATEGORY SUCCESS", res.data);
      setCategoryName("");
      getCategories();
    } catch (err) {
      addLog("ADD CATEGORY ERROR", err.response?.data);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await API.delete(`/category/${id}`);
      addLog("DELETE CATEGORY SUCCESS", res.data);
      getCategories();
    } catch (err) {
      addLog("DELETE CATEGORY ERROR", err.response?.data);
    }
  };

  return (
    <div className="card">
      <h3>📂 Categories</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input className="input-field" placeholder="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
        <button className="btn-primary" onClick={addCategory}>Add</button>
      </div>
      <ul className="list-group">
        {categories.map((c) => (
          <li key={c._id} className="list-item">
            {c.name} <button className="btn-danger btn-sm" onClick={() => deleteCategory(c._id)}>Del</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
