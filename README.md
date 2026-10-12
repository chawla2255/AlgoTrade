# AlgoTrade · AI-powered quantitative trading system

A full-stack platform to design, backtest and analyze systematic trading strategies on real market data.
Pick a ticker, choose one of 11 built-in technical strategies or write your own, and see every trade,
the equity of the strategy and the price history side by side.

**Live demo:** [chawla2255.github.io/algotrade](https://chawla2255.github.io/algotrade) &nbsp;·&nbsp; built May to July 2025

<!-- screenshot: docs/trade.png (backtest view) -->

## What it does

- **Backtest 11 strategies** on six months of daily prices: moving-average crossover, RSI, MACD, Bollinger Bands,
  SMA cross, EMA crossover, Williams %R, stochastic oscillator, CCI, momentum and Parabolic SAR.
- **Write your own strategy** in the in-browser code editor and backtest it with the same engine (the 12th strategy).
- **Market intelligence views:** trending tickers, index cards, market news, stocks to watch and popular portfolios.
- **Candlestick charts** with buy and sell markers for every simulated trade.

## Architecture

```
frontend/  React 18 · Chakra UI · ApexCharts / Recharts · react-router
           Strategy engine in JavaScript (src/components/strategies.js), so the hosted demo needs no server.
           Prices from Yahoo Finance; market widgets from RapidAPI finance endpoints.

backend/   FastAPI · pandas · NumPy · yfinance
           The same strategy engine in Python, exposed as POST /backtest, plus custom strategies
           defined as a Python function `custom_strategy(df)`.
```

| Strategy | Signal |
| --- | --- |
| Moving-average crossover | Short MA crosses the long MA |
| RSI | Oversold / overbought thresholds |
| MACD | MACD line crosses the signal line |
| Bollinger Bands | Price closes outside the bands |
| SMA cross / EMA crossover | Fast and slow average crossovers |
| Williams %R · Stochastic · CCI | Oscillator extremes |
| Momentum | Rate-of-change direction |
| Parabolic SAR | Trend flips |

## Run it locally

**Frontend**

```bash
cd frontend
cp .env.example .env        # add your RapidAPI key for the market widgets
npm install
npm start                   # http://localhost:3000
```

**Backend (optional)**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000/docs
```

```bash
curl -X POST localhost:8000/backtest -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "strategy": "rsi"}'
```

> **Note:** custom strategies run with Python's `exec`. That is fine on your own machine; do not expose the
> backend publicly without sandboxing user code.

## Roadmap

- Position sizing, transaction costs and slippage in the backtester
- Risk metrics per strategy (Sharpe, max drawdown, hit rate) and a strategy comparison view
- Walk-forward testing to avoid overfitting parameters

## Author

**Yuvraj Chawla**, M.S. Quantitative Finance, Northeastern University · [yuvrajchawla.si](https://yuvrajchawla.si) · [LinkedIn](https://www.linkedin.com/in/yuvraj-chawla/)

MIT License.
