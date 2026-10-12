import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  SimpleGrid,
  Badge,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { fetchYahooData, strategies } from "../components/strategies";
import CodeEditor from "../components/CodeEditor";
import StockInfoCard from "../components/StockInfoCard";

const strategyLabels = {
  moving_average_crossover: "Moving Average Crossover",
  rsi: "RSI",
  macd: "MACD",
  bollinger_bands: "Bollinger Bands",
  sma_cross: "SMA Cross",
  ema_crossover: "EMA Crossover",
  williams_r: "Williams %R",
  stochastic_oscillator: "Stochastic Oscillator",
  cci: "CCI",
  momentum: "Momentum",
  parabolic_sar: "Parabolic SAR",
  custom: "Custom Strategy",
};

const Trade = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [strategy, setStrategy] = useState("moving_average_crossover");
  const [customCode, setCustomCode] = useState("// return [];");
  const [result, setResult] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const toast = useToast();

  const handleSymbolChange = (e) => {
    const val = e.target.value.toUpperCase();
    setSymbol(val);
    if (!val.trim()) {
      // clear everything if symbol is blank
      setResult(null);
      setShowCard(false);
    }
  };

  const handleRun = async () => {
    if (!symbol.trim()) {
      toast({
        title: "Please enter a stock symbol",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { dates, closePrices } = await fetchYahooData(symbol);
      let trades = [];

      if (strategy === "custom") {
        const customFunc = new Function("prices", "dates", customCode);
        trades = customFunc(closePrices, dates);
      } else {
        const strategyFunc = strategies[strategy];
        if (!strategyFunc) throw new Error("Strategy not implemented");
        trades = strategyFunc(closePrices, dates);
      }

      const totalProfit = trades.reduce((sum, trade, idx, arr) => {
        if (trade.type === "SELL" && idx > 0 && arr[idx - 1].type === "BUY") {
          return sum + (trade.price - arr[idx - 1].price);
        }
        return sum;
      }, 0);

      setResult({
        trades,
        total_profit: totalProfit.toFixed(2),
      });

      setShowCard(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error running strategy",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setResult(null);
      setShowCard(false);
    }
  };

  return (
    <Box p={10} maxW="900px" mx="auto">
      <Heading mb={6}>Backtest Strategy</Heading>

      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Enter Stock Symbol (e.g. AAPL)"
          value={symbol}
          onChange={handleSymbolChange}
        />

        <Select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Select a Strategy"
        >
          {Object.keys(strategies).map((key) => (
            <option key={key} value={key}>
              {strategyLabels[key] || key}
            </option>
          ))}
          <option value="custom">{strategyLabels["custom"]}</option>
        </Select>

        {strategy === "custom" && (
          <CodeEditor value={customCode} onChange={setCustomCode} />
        )}

        <Button colorScheme="teal" onClick={handleRun}>
          Run Backtest
        </Button>
      </VStack>

      {showCard && symbol && (
        <Box mt={10}>
          <StockInfoCard symbol={symbol} />
        </Box>
      )}

      {result && (
        <Box mt={10}>
          <Heading size="md" mb={2}>
            Backtest Results
          </Heading>
          <Text fontWeight="bold" fontSize="xl" mt={2}>
            Total Profit: ${result.total_profit}
          </Text>
          <SimpleGrid columns={[1, 2]} spacing={4} mt={4}>
            {result.trades.map((trade, idx) => (
              <Card
                key={idx}
                border="1px"
                borderColor={trade.type === "BUY" ? "green.400" : "red.400"}
                background={trade.type === "BUY" ? "green.50" : "red.50"}
                shadow="sm"
              >
                <CardHeader>
                  <Badge
                    colorScheme={trade.type === "BUY" ? "green" : "red"}
                    fontSize="sm"
                    px={2}
                    py={1}
                  >
                    {trade.type}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.600">
                    Date: <strong>{trade.date}</strong>
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Price: <strong>${trade.price.toFixed(2)}</strong>
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default Trade;
