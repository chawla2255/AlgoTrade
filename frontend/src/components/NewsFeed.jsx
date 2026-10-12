import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  SimpleGrid,
  Spinner,
  Link,
  Flex,
  Badge,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";

const NewsFeedYahoo = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news",
    params: { type: "ALL" },
    headers: {
      "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
      "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
    },
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.request(options);
        setNews(response.data.body.slice(0, 30)); // Limit to 30 articles
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <Box px={[4, 8]} py={[6, 10]} bg="gray.50" minHeight="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">
          🗞️ Market Headlines
        </Heading>
      </Flex>

      {loading ? (
        <Flex justify="center" mt={20}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {news.map((item, idx) => (
            <Box
              key={idx}
              bg="white"
              borderRadius="md"
              boxShadow="md"
              overflow="hidden"
              _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s ease-in-out"
            >
              {item.img && (
                <Image
                  src={item.img}
                  alt={item.title}
                  objectFit="cover"
                  width="100%"
                  height="160px"
                />
              )}
              <Box p={4}>
                <Stack spacing={1} mb={2}>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme="blue" fontSize="0.75em">
                      {item.source}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {moment(item.time).fromNow()}
                    </Text>
                  </Flex>
                </Stack>
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecor: "none" }}
                >
                  <Text
                    fontWeight="semibold"
                    fontSize="md"
                    color="gray.800"
                    noOfLines={3}
                  >
                    {item.title}
                  </Text>
                </Link>
                <Text fontSize="sm" color="gray.600" mt={2} noOfLines={3}>
                  {item.text}
                </Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default NewsFeedYahoo;
