import Skill from "../models/Skill.js";

export const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};