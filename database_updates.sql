-- Database Migration: Reflect 30% Fee & 7x Buyout Terms

-- 1. Add Protocol Fee, Royalty, and Buyout columns to 'projects' table
DO $$ 
BEGIN
    -- Protocol Fee (Hardcoded 30% in Smart Contract, reflected here for UI)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'protocol_fee_bps') THEN
        ALTER TABLE projects ADD COLUMN protocol_fee_bps INTEGER DEFAULT 3000; -- Basis Points (3000 = 30%)
    END IF;

    -- Perpetual Royalty (30% revenue share from License)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'royalty_bps') THEN
        ALTER TABLE projects ADD COLUMN royalty_bps INTEGER DEFAULT 3000; -- Basis Points (3000 = 30%)
    END IF;

    -- Buyout Multiple (7x Development Fees)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'buyout_multiple') THEN
        ALTER TABLE projects ADD COLUMN buyout_multiple DOUBLE PRECISION DEFAULT 7.0;
    END IF;

    -- License Version Tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'license_version') THEN
        ALTER TABLE projects ADD COLUMN license_version TEXT DEFAULT 'CONDITIONAL_STRICT_V1';
    END IF;
END $$;

-- 2. Update existing records (Optional: Enforce on all current projects)
UPDATE projects 
SET 
  protocol_fee_bps = 3000,
  royalty_bps = 3000,
  buyout_multiple = 7.0,
  license_version = 'CONDITIONAL_STRICT_V1'
WHERE protocol_fee_bps IS NULL;
