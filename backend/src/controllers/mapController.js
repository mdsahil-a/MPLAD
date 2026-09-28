import { db } from '../data/db.js';

export const getMapData = (req, res) => {
  const mapData = db.getMapData();
  res.json(mapData);
};
