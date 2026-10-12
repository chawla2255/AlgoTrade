import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  VStack,
  HStack,
  Divider,
  Badge,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";

const StockInfoCard = ({ symbol }) => {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchStockMeta = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`
        )}`;
        const res = await fetch(url);
        const raw = await res.json();
        const json = JSON.parse(raw.contents);
        const stockMeta = json?.chart?.result?.[0]?.meta;
        if (stockMeta) setMeta(stockMeta);
      } catch (err) {
        console.error("Failed to fetch stock data:", err);
        setMeta(null);
      }
      setLoading(false);
    };

    fetchStockMeta();
  }, [symbol]);

  if (!symbol) return null;
  if (loading)
    return (
      <Box mt={8} textAlign="center">
        <Spinner size="lg" />
      </Box>
    );
  if (!meta) return null;

  const {
    symbol: ticker,
    fullExchangeName,
    longName,
    regularMarketPrice,
    regularMarketDayHigh,
    regularMarketDayLow,
    regularMarketVolume,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    currency,
  } = meta;

  return (
    <Box
      mt={10}
      p={6}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="md"
      boxShadow="md"
      bg={cardBg}
    >
      <Flex justify="space-between" wrap="wrap" mb={4}>
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold">
            {longName || ticker}
          </Text>
          <HStack>
            <Badge colorScheme="purple">{ticker}</Badge>
            <Badge colorScheme="gray">{fullExchangeName}</Badge>
          </HStack>
        </VStack>

        <Stat textAlign="right">
          <StatLabel>Market Price</StatLabel>
          <StatNumber fontSize="2xl">
            ${regularMarketPrice?.toFixed(2)}
          </StatNumber>
          <StatHelpText>{currency}</StatHelpText>
        </Stat>
      </Flex>

      <Divider mb={4} />

      <Flex wrap="wrap" justify="space-between" gap={4}>
        <MiniStat
          label="Day High"
          value={`$${regularMarketDayHigh?.toFixed(2)}`}
        />
        <MiniStat
          label="Day Low"
          value={`$${regularMarketDayLow?.toFixed(2)}`}
        />
        <MiniStat
          label="Volume"
          value={regularMarketVolume?.toLocaleString()}
        />
        <MiniStat label="52W High" value={`$${fiftyTwoWeekHigh?.toFixed(2)}`} />
        <MiniStat label="52W Low" value={`$${fiftyTwoWeekLow?.toFixed(2)}`} />
      </Flex>
    </Box>
  );
};

const MiniStat = ({ label, value }) => (
  <Box minW="120px">
    <Stat>
      <StatLabel>{label}</StatLabel>
      <StatNumber fontSize="lg">{value}</StatNumber>
    </Stat>
  </Box>
);

export default StockInfoCard;
