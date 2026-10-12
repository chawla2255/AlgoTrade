import React, { useEffect, useState } from "react";
import { Box, Text, HStack, Spinner } from "@chakra-ui/react";
import axios from "axios";

const TrendingTickerBar = () => {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
  const host = "yahoo-finance-real-time1.p.rapidapi.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get trending symbols
        const trendingRes = await axios.get(
          "https://yahoo-finance-real-time1.p.rapidapi.com/market/get-trending-tickers",
          {
            params: { region: "US" },
            headers: {
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": host,
            },
          }
        );

        const symbols = trendingRes.data.finance?.result?.[0]?.quotes
          ?.map((q) => q.symbol)
          .slice(0, 10);
        if (!symbols.length) return;

        // 2. Fetch stock option summary for each
        const stockDetails = await Promise.all(
          symbols.map((symbol) =>
            axios.get(
              "https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-options",
              {
                params: { symbol, region: "US", lang: "en-US" },
                headers: {
                  "X-RapidAPI-Key": apiKey,
                  "X-RapidAPI-Host": host,
                },
              }
            )
          )
        );

        const data = stockDetails.map((res) => {
          const quote = res.data.optionChain?.result?.[0]?.quote;
          return {
            symbol: quote?.symbol,
            price: quote?.regularMarketPrice,
            change: quote?.regularMarketChange,
            percent: quote?.regularMarketChangePercent,
          };
        });

        setTickers(data);
      } catch (err) {
        console.error("Error fetching trending data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      overflow="hidden"
      whiteSpace="nowrap"
      bg="gray.900"
      color="white"
      py={2}
      position="relative"
    >
      <Box
        display="inline-block"
        animation="scroll 20s linear infinite"
        minWidth="100%"
        sx={{
          "@keyframes scroll": {
            from: { transform: "translateX(100%)" },
            to: { transform: "translateX(-100%)" },
          },
        }}
      >
        <HStack spacing={10} px={4}>
          {loading ? (
            <Spinner color="white" />
          ) : (
            tickers.map((item, index) => (
              <Box key={index} textAlign="center">
                <Text fontWeight="bold">{item.symbol}</Text>
                <Text
                  fontSize="sm"
                  color={item.change < 0 ? "red.300" : "green.300"}
                >
                  ${item.price?.toFixed(2)} ({item.percent?.toFixed(2)}%)
                </Text>
              </Box>
            ))
          )}
        </HStack>
      </Box>
    </Box>
  );
};

export default TrendingTickerBar;
