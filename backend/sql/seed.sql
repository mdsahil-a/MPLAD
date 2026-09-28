-- MPLAD Anomaly Detection System (SIH26102) Database Seed Data

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@mplad.gov.in', 'admin123', 'Administrator'),
('Aarav Nair', 'aarav@mplad.gov.in', 'aarav123', 'System Administrator');

INSERT INTO projects (id, work, mp, district, category, location, sanctioned, spent, estimated_cost, actual_cost, progress, delay_days, status, fin_signal, net_signal, dup_signal, photo_signal, risk, description) VALUES
('MPL-1001', 'Construction of Community Hall in Ward 12', 'A. Sharma', 'North district', 'Community Infrastructure', 'Bhopal, Madhya Pradesh', 4500000.00, 4200000.00, 3000000.00, 4200000.00, 25, 180, 'Under Review', 85, 78, 12, 90, 88, 'Construction of a multi-purpose community hall for public gatherings and local civic events.'),
('MPL-1002', 'Drinking Water Supply & Borewell Upgrade', 'R. Verma', 'Riverside constituency', 'Water & Sanitation', 'Indore, Madhya Pradesh', 2800000.00, 2750000.00, 2000000.00, 2750000.00, 40, 150, 'Delayed', 75, 70, 80, 65, 76, 'Installation of high-capacity solar borewells and distribution pipelines across 5 villages.'),
('MPL-1003', 'Road Widening & Asphalt Paving', 'S. Reddy', 'Hill block', 'Roads & Bridges', 'Gwalior, Madhya Pradesh', 5800000.00, 5600000.00, 5000000.00, 5600000.00, 90, 30, 'In Progress', 45, 30, 15, 25, 38, 'Widening of 4km stretch connecting Gram Panchayat to main state highway.'),
('MPL-1004', 'Solar Street Lighting Installation', 'K. Nair', 'Central ward', 'Renewable Energy', 'Jabalpur, Madhya Pradesh', 1500000.00, 1450000.00, 1500000.00, 1450000.00, 100, 0, 'Completed', 10, 10, 5, 10, 12, 'Erection of 120 standalone solar streetlights in un-electrified hamlet areas.'),
('MPL-1005', 'Government High School Renovation', 'M. Iyer', 'North district', 'Education', 'Ujjain, Madhya Pradesh', 3500000.00, 3100000.00, 3500000.00, 3100000.00, 70, 45, 'In Progress', 30, 40, 10, 20, 32, 'Structural repair, modern science lab setup, and classroom painting for Govt School.');

INSERT INTO alerts (project_id, type, message, risk, status) VALUES
('MPL-1001', 'Cost Anomaly', 'Actual cost is significantly higher than estimated baseline.', 'High', 'Under Review'),
('MPL-1002', 'Possible Duplicate', 'High semantic similarity with existing municipal borewell project.', 'High', 'Under Review'),
('MPL-1003', 'Minor Delay', 'Slight schedule slippage due to monsoon rain.', 'Medium', 'Monitored');
