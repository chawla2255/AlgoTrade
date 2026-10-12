import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Heading,
  SimpleGrid,
  Spinner,
  Flex,
  Badge,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";

const indices = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^FTSE", name: "FTSE 100" },
  { symbol: "^N225", name: "Nikkei 225" },
  { symbol: "^HSI", name: "Hang Seng" },
];

const IndexCards = () => {
  const [indexData, setIndexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const responses = await Promise.all(
          indices.map((index) =>
            axios.get(
              "https://yahoo-finance166.p.rapidapi.com/api/stock/get-price",
              {
                params: {
                  region: "US",
                  symbol: index.symbol,
                },
                headers: {
                  "x-rapidapi-key":
                    process.env.REACT_APP_RAPIDAPI_KEY,
                  "x-rapidapi-host": "yahoo-finance166.p.rapidapi.com",
                },
              }
            )
          )
        );

        const formatted = responses.map((res, i) => ({
          name: indices[i].name,
          symbol: indices[i].symbol,
          price: res.data.quoteSummary.result[0].price.regularMarketPrice.raw,
          change: res.data.quoteSummary.result[0].price.regularMarketChange.raw,
          changePercent:
            res.data.quoteSummary.result[0].price.regularMarketChangePercent
              .raw,
        }));

        setIndexData(formatted);
      } catch (error) {
        console.error("Error fetching indices:", error);
        setIndexData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
  }, []);

  return (
    <Box px={[4, 8]} py={[6, 10]} bg="gray.50">
      <Heading size="lg" mb={6} textAlign="left" color="gray.800">
        🌍 Global Market Indices
      </Heading>

      {loading ? (
        <Flex justify="center">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {indexData.map((index, idx) => (
            <Box
              key={idx}
              bg={bg}
              borderRadius="md"
              boxShadow="md"
              p={5}
              transition="all 0.2s ease"
              _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
            >
              <Stack spacing={3}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {index.name}
                  </Text>
                  <Badge
                    fontSize="0.9em"
                    colorScheme={index.changePercent >= 0 ? "green" : "red"}
                  >
                    {index.changePercent.toFixed(2)}%
                  </Badge>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold">
                  ${index.price.toFixed(2)}
                </Text>
                <Text color={index.change >= 0 ? "green.500" : "red.500"}>
                  {index.change >= 0 ? "+" : ""}
                  {index.change.toFixed(2)}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default IndexCards;
