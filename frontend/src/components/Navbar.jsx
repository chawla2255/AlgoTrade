import React from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const bgColor = useColorModeValue("whiteAlpha.900", "gray.900");

  return (
    <Box
      bg="rgba(26, 32, 44, 0.95)"
      backdropFilter="blur(12px)"
      px={[4, 6, 10]}
      py={3}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between">
        {/* Brand */}
        <Heading
          size="lg"
          fontWeight="bold"
          color="white"
          letterSpacing="-0.5px"
        >
          AlgoTrade
        </Heading>

        {/* Navigation */}
        <Flex align="center" gap={[2, 4, 6]}>
          {[
            { label: "Home", to: "/" },
            { label: "Stocks to Watch", to: "/stocks-to-watch" },
            { label: "Popular Portfolios", to: "/popular-portfolios" },
          ].map((item) => (
            <Button
              key={item.to}
              as={Link}
              to={item.to}
              variant="ghost"
              color="white"
              fontWeight="medium"
              fontSize="md"
              border="1px solid transparent"
              _hover={{
                border: "1px solid teal",
                background: "rgba(0,255,255,0.1)",
                boxShadow: "0 0 10px rgba(0,255,255,0.2)",
              }}
              transition="all 0.25s ease"
            >
              {item.label}
            </Button>
          ))}

          <Button
            as={Link}
            to="/trade"
            bg="teal.400"
            color="white"
            fontWeight="semibold"
            fontSize="md"
            px={6}
            py={2}
            borderRadius="md"
            boxShadow="md"
            _hover={{
              bg: "teal.500",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 20px rgba(0, 255, 255, 0.3)",
            }}
            transition="all 0.25s ease"
          >
            BackTest Algos
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
