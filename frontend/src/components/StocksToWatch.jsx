import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Text,
  Flex,
  Badge,
  Stack,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import axios from "axios";

const fetchYahooPriceData = async (symbol) => {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`
    )}`;
    const response = await fetch(url);
    const raw = await response.json();
    const json = JSON.parse(raw.contents);

    const result = json.chart?.result?.[0];
    const close = result?.indicators?.quote?.[0]?.close;

    if (!close || close.length < 2) return null;

    const last = close[close.length - 1];
    const prev = close[close.length - 2];
    const percentChange = (((last - prev) / prev) * 100).toFixed(2);

    return {
      price: last.toFixed(2),
      change: percentChange,
    };
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${symbol}`, error);
    return null;
  }
};

const StocksToWatch = () => {
  const [categories, setCategories] = useState({});
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://seeking-alpha-finance.p.rapidapi.com/v1/markets/day-watch",
          {
            headers: {
              "x-rapidapi-key":
                process.env.REACT_APP_RAPIDAPI_KEY,
              "x-rapidapi-host": "seeking-alpha-finance.p.rapidapi.com",
            },
          }
        );

        const data = response.data?.data?.attributes;
        if (!data) throw new Error("Invalid data structure");

        const allStocks = [
          ...data.top_gainers,
          ...data.top_losers,
          ...data.most_active,
        ];
        const uniqueSymbols = [...new Set(allStocks.map((s) => s.slug))];

        const priceResults = await Promise.allSettled(
          uniqueSymbols.map(fetchYahooPriceData)
        );

        const prices = {};
        uniqueSymbols.forEach((symbol, idx) => {
          if (
            priceResults[idx].status === "fulfilled" &&
            priceResults[idx].value
          ) {
            prices[symbol] = priceResults[idx].value;
          }
        });

        setCategories({
          "Top Gainers": data.top_gainers,
          "Top Losers": data.top_losers,
          "Most Active": data.most_active,
        });

        setStockData(prices);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box px={[4, 6]} py={[6, 10]} bg="gray.50" minH="100vh">
      <Heading size="lg" mb={6} color="gray.800" fontWeight="bold">
        📈 Stocks to Watch Today
      </Heading>

      {Object.entries(categories).map(([category, stocks]) => (
        <Box key={category} mb={12}>
          <Heading size="md" mb={4} color="teal.600">
            {category}
          </Heading>
          <SimpleGrid columns={[1, 2, 3]} spacing={5}>
            {stocks.map((stock) => {
              const info = stockData[stock.slug];
              return (
                <Box
                  key={stock.slug}
                  p={4}
                  borderRadius="md"
                  bg="white"
                  boxShadow="md"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    boxShadow: "lg",
                    transform: "translateY(-2px)",
                    transition: "0.2s ease",
                  }}
                >
                  <Stack spacing={2}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {stock.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {stock.slug}
                    </Text>
                    {info ? (
                      <Text fontSize="sm">
                        ${info.price}{" "}
                        <Badge
                          ml={2}
                          colorScheme={info.change >= 0 ? "green" : "red"}
                          fontSize="0.8em"
                        >
                          {info.change}%
                        </Badge>
                      </Text>
                    ) : (
                      <Skeleton height="20px" width="80px" />
                    )}
                  </Stack>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  );
};

export default StocksToWatch;
