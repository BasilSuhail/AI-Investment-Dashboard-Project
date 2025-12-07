-- CFO's Cockpit Database Schema
-- Supabase PostgreSQL Schema for caching and portfolio storage

-- Market Data Cache Table
-- Stores historical stock prices to reduce API calls to yfinance
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  adj_close DECIMAL(10, 2) NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_market_data_ticker ON market_data_cache(ticker);
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data_cache(date);
CREATE INDEX IF NOT EXISTS idx_market_data_cached_at ON market_data_cache(cached_at);

-- Portfolios Table
-- Stores user portfolios and optimization results
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  tickers TEXT[] NOT NULL,
  weights JSONB NOT NULL,
  investment_amount DECIMAL(12, 2) NOT NULL,
  expected_return DECIMAL(5, 4),
  volatility DECIMAL(5, 4),
  sharpe_ratio DECIMAL(5, 4),
  optimization_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

-- Optimization Results Cache Table
-- Caches optimization results to speed up repeated calculations
CREATE TABLE IF NOT EXISTS optimization_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tickers_hash VARCHAR(64) NOT NULL,
  start_date DATE NOT NULL,
  optimization_type VARCHAR(50) NOT NULL,
  result JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tickers_hash, start_date, optimization_type)
);

CREATE INDEX IF NOT EXISTS idx_optimization_cache_hash ON optimization_cache(tickers_hash);
CREATE INDEX IF NOT EXISTS idx_optimization_cache_cached_at ON optimization_cache(cached_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for portfolios table
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE market_data_cache IS 'Caches historical stock prices (24-hour TTL)';
COMMENT ON TABLE portfolios IS 'Stores user portfolio configurations and optimization results';
COMMENT ON TABLE optimization_cache IS 'Caches portfolio optimization results (1-hour TTL)';
