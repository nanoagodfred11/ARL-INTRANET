# Adamus Resources - Department Structure

## Department Codes & Contact Setup

Use these codes when setting up the departments table in the database.

| # | Department | Code | Category | Notes |
|---|------------|------|----------|-------|
| 1 | MTS | MTS | Contractor | Mining contractor |
| 2 | TSF | TSF | Contractor | Tailings Storage Facility |
| 3 | Liebherr | LIEB | Contractor | Heavy equipment |
| 4 | Drill Masters | DRILL | Contractor | Drilling contractor |
| 5 | Commercial | COMM | Support | Commercial operations |
| 6 | DFSL Exploration | DFSL-EXP | DFSL | Exploration team |
| 7 | DFSL Safety | DFSL-SAF | DFSL | Safety team |
| 8 | DFSL HR & Admin | DFSL-HR | DFSL | HR and Administration |
| 9 | DFSL Stores | DFSL-STR | DFSL | Stores/Inventory |
| 10 | DFSL Workshop | DFSL-WRK | DFSL | Workshop/Maintenance |
| 11 | Mining | MINING | Operations | Core mining operations |
| 12 | Geology | GEO | Operations | Geological services |
| 13 | Process | PROC | Operations | Processing plant |
| 14 | Security | SEC | Support | Site security |
| 15 | HSE | HSE | Support | Health, Safety & Environment |
| 16 | Toll | TOLL | Operations | Toll processing |
| 17 | SRD | SRD | Support | Sustainable Rural Development |
| 18 | Supply | SUPPLY | Support | Supply chain |
| 19 | Exploration | EXPLOR | Operations | Exploration |
| 20 | Engineering | ENG | Operations | Engineering services |

## Department Hierarchy (Suggested)

```
Adamus Resources Limited
├── Operations
│   ├── Mining
│   ├── Geology
│   ├── Process
│   ├── Toll
│   ├── Exploration
│   └── Engineering
├── Support Services
│   ├── Commercial
│   ├── Security
│   ├── HSE
│   ├── SRD
│   └── Supply
├── DFSL (Subsidiary)
│   ├── DFSL Exploration
│   ├── DFSL Safety
│   ├── DFSL HR & Admin
│   ├── DFSL Stores
│   └── DFSL Workshop
└── Contractors
    ├── MTS
    ├── TSF
    ├── Liebherr
    └── Drill Masters
```

## SQL Insert Script

```sql
-- Insert departments
INSERT INTO departments (name, code, description) VALUES
('MTS', 'MTS', 'Mining contractor services'),
('TSF', 'TSF', 'Tailings Storage Facility operations'),
('Liebherr', 'LIEB', 'Heavy equipment contractor'),
('Drill Masters', 'DRILL', 'Drilling contractor services'),
('Commercial', 'COMM', 'Commercial operations and business development'),
('DFSL Exploration', 'DFSL-EXP', 'DFSL Exploration team'),
('DFSL Safety', 'DFSL-SAF', 'DFSL Safety team'),
('DFSL HR & Admin', 'DFSL-HR', 'DFSL Human Resources and Administration'),
('DFSL Stores', 'DFSL-STR', 'DFSL Stores and Inventory management'),
('DFSL Workshop', 'DFSL-WRK', 'DFSL Workshop and Maintenance'),
('Mining', 'MINING', 'Core mining operations'),
('Geology', 'GEO', 'Geological services and exploration'),
('Process', 'PROC', 'Gold processing plant operations'),
('Security', 'SEC', 'Site security services'),
('HSE', 'HSE', 'Health, Safety and Environment'),
('Toll', 'TOLL', 'Toll processing operations'),
('SRD', 'SRD', 'Sustainable Rural Development'),
('Supply', 'SUPPLY', 'Supply chain and procurement'),
('Exploration', 'EXPLOR', 'Mineral exploration'),
('Engineering', 'ENG', 'Engineering services and projects');
```
    
    