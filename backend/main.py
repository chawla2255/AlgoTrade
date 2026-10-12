from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    custom_code: str = ""


# -------------------- Strategy Functions --------------------

def moving_average_crossover(df):
    df["sma_5"] = df["close"].rolling(5).mean()
    df["sma_20"] = df["close"].rolling(20).mean()
    trades, position = [], None
    for i in range(1, len(df)):
        if df["sma_5"][i] > df["sma_20"][i] and df["sma_5"][i-1] <= df["sma_20"][i-1] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["sma_5"][i] < df["sma_20"][i] and df["sma_5"][i-1] >= df["sma_20"][i-1] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def rsi(df):
    delta = df["close"].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain).rolling(14).mean()
    avg_loss = pd.Series(loss).rolling(14).mean()
    rs = avg_gain / avg_loss
    df["rsi"] = 100 - (100 / (1 + rs))
    trades, position = [], None
    for i in range(14, len(df)):
        if df["rsi"][i] < 30 and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["rsi"][i] > 70 and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def macd(df):
    df["ema12"] = df["close"].ewm(span=12).mean()
    df["ema26"] = df["close"].ewm(span=26).mean()
    df["macd"] = df["ema12"] - df["ema26"]
    df["signal"] = df["macd"].ewm(span=9).mean()
    trades, position = [], None
    for i in range(1, len(df)):
        if df["macd"][i] > df["signal"][i] and df["macd"][i-1] <= df["signal"][i-1] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["macd"][i] < df["signal"][i] and df["macd"][i-1] >= df["signal"][i-1] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def bollinger_bands(df):
    df["ma20"] = df["close"].rolling(20).mean()
    df["stddev"] = df["close"].rolling(20).std()
    df["upper"] = df["ma20"] + 2 * df["stddev"]
    df["lower"] = df["ma20"] - 2 * df["stddev"]
    trades, position = [], None
    for i in range(len(df)):
        if df["close"][i] < df["lower"][i] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["close"][i] > df["upper"][i] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def sma_cross(df):
    df["sma50"] = df["close"].rolling(50).mean()
    df["sma200"] = df["close"].rolling(200).mean()
    trades, position = [], None
    for i in range(1, len(df)):
        if df["sma50"][i] > df["sma200"][i] and df["sma50"][i-1] <= df["sma200"][i-1] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["sma50"][i] < df["sma200"][i] and df["sma50"][i-1] >= df["sma200"][i-1] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def ema_crossover(df):
    df["ema12"] = df["close"].ewm(span=12).mean()
    df["ema26"] = df["close"].ewm(span=26).mean()
    trades, position = [], None
    for i in range(1, len(df)):
        if df["ema12"][i] > df["ema26"][i] and df["ema12"][i-1] <= df["ema26"][i-1] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["ema12"][i] < df["ema26"][i] and df["ema12"][i-1] >= df["ema26"][i-1] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def williams_r(df):
    df["hh"] = df["close"].rolling(14).max()
    df["ll"] = df["close"].rolling(14).min()
    df["williams_r"] = -100 * (df["hh"] - df["close"]) / (df["hh"] - df["ll"])
    trades, position = [], None
    for i in range(14, len(df)):
        if df["williams_r"][i] < -80 and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["williams_r"][i] > -20 and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def stochastic_oscillator(df):
    df["low14"] = df["close"].rolling(14).min()
    df["high14"] = df["close"].rolling(14).max()
    df["%K"] = 100 * (df["close"] - df["low14"]) / (df["high14"] - df["low14"])
    trades, position = [], None
    for i in range(14, len(df)):
        if df["%K"][i] < 20 and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["%K"][i] > 80 and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def cci(df):
    tp = df["close"]
    ma = tp.rolling(20).mean()
    md = tp.rolling(20).apply(lambda x: np.mean(
        np.abs(x - np.mean(x))), raw=True)
    df["cci"] = (tp - ma) / (0.015 * md.replace(0, np.nan))
    trades, position = [], None
    for i in range(20, len(df)):
        if df["cci"][i] < -100 and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["cci"][i] > 100 and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def momentum(df):
    df["momentum"] = df["close"] - df["close"].shift(10)
    trades, position = [], None
    for i in range(10, len(df)):
        if df["momentum"][i] > 0 and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["momentum"][i] < 0 and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


def parabolic_sar(df):
    df["sar"] = df["close"].rolling(5).mean()
    trades, position = [], None
    for i in range(5, len(df)):
        if df["close"][i] > df["sar"][i] and not position:
            position = "LONG"
            trades.append(
                {"type": "BUY", "date": df["date"][i], "price": round(df["close"][i], 2)})
        elif df["close"][i] < df["sar"][i] and position:
            position = None
            trades.append(
                {"type": "SELL", "date": df["date"][i], "price": round(df["close"][i], 2)})
    return trades


# -------------------- Strategy Map --------------------

STRATEGY_MAP = {
    "moving_average_crossover": moving_average_crossover,
    "rsi": rsi,
    "macd": macd,
    "bollinger_bands": bollinger_bands,
    "sma_cross": sma_cross,
    "ema_crossover": ema_crossover,
    "williams_r": williams_r,
    "stochastic_oscillator": stochastic_oscillator,
    "cci": cci,
    "momentum": momentum,
    "parabolic_sar": parabolic_sar
}

# -------------------- API Route --------------------


@app.post("/backtest")
async def backtest(data: BacktestRequest):
    try:
        df = yf.download(data.symbol.upper(), period="6mo", interval="1d")
        if df is None or df.empty or "Close" not in df.columns:
            raise ValueError("Could not retrieve valid stock data.")

        df = df.reset_index().rename(
            columns={"Date": "date", "Close": "close"})
        df["close"] = pd.to_numeric(df["close"], errors="coerce")
        df.dropna(subset=["close"], inplace=True)
        df["date"] = df["date"].astype(str)

        if data.strategy == "custom":
            local_vars = {}
            exec(data.custom_code, {"pd": pd, "np": np}, local_vars)
            func = local_vars.get("custom_strategy")
            if not func:
                raise ValueError(
                    "Function 'custom_strategy' not found in custom_code.")
            trades = func(df)
        elif data.strategy in STRATEGY_MAP:
            trades = STRATEGY_MAP[data.strategy](df)
        else:
            raise ValueError(f"Strategy '{data.strategy}' not supported.")

        profit = sum(trades[i + 1]["price"] - trades[i]["price"]
                     for i in range(0, len(trades) - 1, 2))

        return {
            "trades": trades,
            "prices": df[["date", "close"]].to_dict(orient="records"),
            "total_profit": round(profit, 2)
        }

    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
