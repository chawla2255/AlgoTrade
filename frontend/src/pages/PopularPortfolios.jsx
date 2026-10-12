import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Collapse,
  Spinner,
  Flex,
  SimpleGrid,
  Stack,
  Button,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";

const PopularPortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [holdings, setHoldings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await axios.get(
          "https://yahoo-finance166.p.rapidapi.com/api/portfolio/get-most-popular",
          {
            headers: {
              "x-rapidapi-key":
                process.env.REACT_APP_RAPIDAPI_KEY,
              "x-rapidapi-host": "yahoo-finance166.p.rapidapi.com",
            },
          }
        );
        const data = res.data?.finance?.result?.[0]?.portfolios || [];
        setPortfolios(data.slice(0, 15));
      } catch (err) {
        console.error("Error fetching popular portfolios", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleToggle = async (slug) => {
    if (expanded === slug) {
      setExpanded(null);
      return;
    }

    setExpanded(slug);

    if (!holdings[slug]) {
      try {
        const res = await axios.get(
          "https://yahoo-finance166.p.rapidapi.com/api/portfolio/get-details",
          {
            params: { slug },
            headers: {
              "x-rapidapi-key":
                process.env.REACT_APP_RAPIDAPI_KEY,
              "x-rapidapi-host": "yahoo-finance166.p.rapidapi.com",
            },
          }
        );
        const positions =
          res.data?.finance?.result?.[0]?.portfolios?.[0]?.positions || [];
        setHoldings((prev) => ({
          ...prev,
          [slug]: positions,
        }));
      } catch (err) {
        console.error("Error fetching portfolio details", err);
      }
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box px={[4, 6]} py={[6, 10]} bg="gray.50" minH="100vh">
      <Heading size="lg" mb={6} color="gray.800">
        📈 Popular Investment Portfolios
      </Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {portfolios.map((pf) => {
          const isOpen = expanded === pf.slug;
          const stocks = holdings[pf.slug] || [];

          return (
            <Box
              key={pf.slug}
              bg="white"
              borderRadius="md"
              boxShadow="sm"
              p={4}
              _hover={{ boxShadow: "lg" }}
              transition="all 0.3s ease"
            >
              <Stack spacing={3}>
                <Heading size="md" color="gray.700">
                  {pf.name}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {pf.shortDescription}
                </Text>

                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                    {pf.symbolCount} Stocks
                  </Badge>
                  {typeof pf.dailyPercentGain === "number" && (
                    <Badge
                      colorScheme={pf.dailyPercentGain >= 0 ? "green" : "red"}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {pf.dailyPercentGain.toFixed(2)}%
                    </Badge>
                  )}
                </Flex>

                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => handleToggle(pf.slug)}
                >
                  {isOpen ? "Hide Holdings" : "Show Holdings"}
                </Button>

                <Collapse in={isOpen} animateOpacity>
                  <Box mt={2}>
                    {stocks.map((stock) => (
                      <Flex
                        key={stock.posId}
                        justify="space-between"
                        align="center"
                        p={2}
                        borderBottom="1px solid #E2E8F0"
                      >
                        <Text fontWeight="medium" color="gray.700">
                          {stock.symbol}
                        </Text>
                        <Badge colorScheme="gray" fontSize="xs">
                          Qty: {stock.lots?.[0]?.quantity?.toFixed(3) || "N/A"}
                        </Badge>
                      </Flex>
                    ))}
                  </Box>
                </Collapse>
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default PopularPortfolios;
