import StatAttribute from "../models/statattribute.js";

export const createStatAttribute = async (req, res) => {
    try {
        const { label, key, dataType } = req.body;
        const stat = await StatAttribute.create({ label, key, dataType });
        res.status(201).json({ message: "Stat Attribute created", stat });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllStatAttributes = async (req, res) => {
    try {
        const stats = await StatAttribute.find().sort({ createdAt: -1 });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateStatAttribute = async (req, res) => {
    try {
        const { label, key, dataType } = req.body;
        const stat = await StatAttribute.findByIdAndUpdate(
            req.params.id,
            { label, key, dataType },
            { new: true }
        );
        res.json(stat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStatAttribute = async (req, res) => {
    try {
        await StatAttribute.findByIdAndDelete(req.params.id);
        res.json({ message: "Stat Attribute deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
