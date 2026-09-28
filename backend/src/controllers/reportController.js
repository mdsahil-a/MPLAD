import { db } from '../data/db.js';

export const getReports = (req, res) => {
  const reports = db.getReports();
  res.json(reports);
};
