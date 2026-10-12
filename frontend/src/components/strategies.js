export const fetchYahooData = async (symbol) => {
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`
  )}`;

  const res = await fetch(url);
  const data = await res.json();
  const parsed = JSON.parse(data.contents);

  const candles = parsed.chart.result[0];
  const timestamps = candles.timestamp;
  const closePrices = candles.indicators.quote[0].close;

  const dates = timestamps.map((ts) =>
    new Date(ts * 1000).toISOString().split("T")[0]
  );

  return { candles, closePrices, dates };
};

// Strategy: Moving Average Crossover
export const moving_average_crossover = (prices, dates) => {
  const short = 5,
    long = 20;
  let trades = [];
  for (let i = long; i < prices.length; i++) {
    const shortAvg = average(prices.slice(i - short, i));
    const longAvg = average(prices.slice(i - long, i));
    if (shortAvg > longAvg && !trades.length || trades[trades.length - 1]?.type === "SELL") {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (shortAvg < longAvg && trades.length && trades[trades.length - 1].type === "BUY") {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: RSI
export const rsi = (prices, dates) => {
  let trades = [];
  const period = 14;
  const rsis = getRSI(prices, period);
  for (let i = period; i < prices.length; i++) {
    if (rsis[i] < 30) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (rsis[i] > 70) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: MACD
export const macd = (prices, dates) => {
  let trades = [];
  const { macdLine, signalLine } = getMACD(prices);
  for (let i = 1; i < prices.length; i++) {
    if (macdLine[i - 1] < signalLine[i - 1] && macdLine[i] > signalLine[i]) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (
      macdLine[i - 1] > signalLine[i - 1] &&
      macdLine[i] < signalLine[i]
    ) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: Bollinger Bands
export const bollinger_bands = (prices, dates) => {
  let trades = [];
  const period = 20;
  for (let i = period; i < prices.length; i++) {
    const slice = prices.slice(i - period, i);
    const avg = average(slice);
    const std = standardDeviation(slice);
    const upper = avg + 2 * std;
    const lower = avg - 2 * std;

    if (prices[i] < lower) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (prices[i] > upper) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: SMA Cross
export const sma_cross = (prices, dates) => {
  let trades = [];
  const short = 10,
    long = 50;
  for (let i = long; i < prices.length; i++) {
    const shortSMA = average(prices.slice(i - short, i));
    const longSMA = average(prices.slice(i - long, i));
    if (
      shortSMA > longSMA &&
      (!trades.length || trades[trades.length - 1].type === "SELL")
    ) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (
      shortSMA < longSMA &&
      trades.length &&
      trades[trades.length - 1].type === "BUY"
    ) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: EMA Crossover
export const ema_crossover = (prices, dates) => {
  let trades = [];
  const shortEMA = getEMA(prices, 12);
  const longEMA = getEMA(prices, 26);
  for (let i = 1; i < prices.length; i++) {
    if (
      shortEMA[i - 1] < longEMA[i - 1] &&
      shortEMA[i] > longEMA[i]
    ) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (
      shortEMA[i - 1] > longEMA[i - 1] &&
      shortEMA[i] < longEMA[i]
    ) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: Williams %R
export const williams_r = (prices, dates) => {
  let trades = [];
  const period = 14;
  for (let i = period; i < prices.length; i++) {
    const high = Math.max(...prices.slice(i - period, i));
    const low = Math.min(...prices.slice(i - period, i));
    const wr = ((high - prices[i]) / (high - low)) * -100;
    if (wr < -80) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (wr > -20) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: Stochastic Oscillator
export const stochastic_oscillator = (prices, dates) => {
  let trades = [];
  const period = 14;
  for (let i = period; i < prices.length; i++) {
    const high = Math.max(...prices.slice(i - period, i));
    const low = Math.min(...prices.slice(i - period, i));
    const k = ((prices[i] - low) / (high - low)) * 100;
    if (k < 20) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (k > 80) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: CCI
export const cci = (prices, dates) => {
  let trades = [];
  const period = 20;
  for (let i = period; i < prices.length; i++) {
    const avg = average(prices.slice(i - period, i));
    const md = meanDeviation(prices.slice(i - period, i), avg);
    const cciVal = (prices[i] - avg) / (0.015 * md);
    if (cciVal < -100) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (cciVal > 100) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: Momentum
export const momentum = (prices, dates) => {
  let trades = [];
  const period = 10;
  for (let i = period; i < prices.length; i++) {
    if (prices[i] > prices[i - period]) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (prices[i] < prices[i - period]) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Strategy: Parabolic SAR (simplified)
export const parabolic_sar = (prices, dates) => {
  let trades = [];
  for (let i = 2; i < prices.length; i++) {
    if (prices[i] > prices[i - 1] && prices[i - 1] < prices[i - 2]) {
      trades.push({ type: "BUY", price: prices[i], date: dates[i] });
    } else if (prices[i] < prices[i - 1] && prices[i - 1] > prices[i - 2]) {
      trades.push({ type: "SELL", price: prices[i], date: dates[i] });
    }
  }
  return trades;
};

// Utility Functions
const average = (arr) =>
  arr.reduce((sum, val) => sum + val, 0) / arr.length;

const standardDeviation = (arr) => {
  const avg = average(arr);
  const squareDiffs = arr.map((val) => (val - avg) ** 2);
  return Math.sqrt(average(squareDiffs));
};

const meanDeviation = (arr, mean) =>
  arr.reduce((acc, val) => acc + Math.abs(val - mean), 0) / arr.length;

const getEMA = (prices, period) => {
  const k = 2 / (period + 1);
  let emaArray = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    emaArray.push(prices[i] * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
};

const getRSI = (prices, period) => {
  let gains = 0,
    losses = 0;
  let rsiArr = Array(period).fill(50);

  for (let i = 1; i <= period; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsiArr[period] = 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    let diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    rsiArr[i] = 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsiArr;
};

const getMACD = (prices) => {
  const shortEMA = getEMA(prices, 12);
  const longEMA = getEMA(prices, 26);
  const macdLine = shortEMA.map((val, idx) => val - longEMA[idx]);
  const signalLine = getEMA(macdLine, 9);
  return { macdLine, signalLine };
};

// Export all strategies
export const strategies = {
  moving_average_crossover,
  rsi,
  macd,
  bollinger_bands,
  sma_cross,
  ema_crossover,
  williams_r,
  stochastic_oscillator,
  cci,
  momentum,
  parabolic_sar,
};
