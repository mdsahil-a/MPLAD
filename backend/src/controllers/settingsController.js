import { db } from '../data/db.js';

export const getSettings = (req, res) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    data: settings
  });
};

export const updateSettings = (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({
    success: true,
    message: "Settings updated successfully",
    data: updated
  });
};
