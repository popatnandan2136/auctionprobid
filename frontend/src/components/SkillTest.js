import React, { useState, useEffect } from "react";
import API from "../api";

export default function SkillTest({ addLog }) {
  const [skillName, setSkillName] = useState("");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    getSkills();
  }, []);

  const getSkills = async () => {
    try {
      const res = await API.get("/skill");
      setSkills(res.data);
      addLog("FETCH SKILLS", res.data);
    } catch (err) {
      addLog("FETCH SKILLS ERROR", err.response?.data);
    }
  };

  const addSkill = async () => {
    try {
      const res = await API.post("/skill", { name: skillName });
      addLog("ADD SKILL SUCCESS", res.data);
      setSkillName("");
      getSkills();
    } catch (err) {
      addLog("ADD SKILL ERROR", err.response?.data);
    }
  };

  return (
    <div className="card">
      <h3>✨ Skills</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input className="input-field" placeholder="Skill Name" value={skillName} onChange={(e) => setSkillName(e.target.value)} />
        <button className="btn-primary" onClick={addSkill}>Add</button>
      </div>
      <div className="skill-tags">
        {skills.map((s) => (
          <span key={s._id} className="tag">{s.name}</span>
        ))}
      </div>
    </div>
  );
}
