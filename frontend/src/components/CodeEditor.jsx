import React from "react";
import Editor from "react-simple-code-editor";
import { Box, Text, Button, VStack, HStack } from "@chakra-ui/react";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

const exampleStrategies = [
  {
    name: "Dip Buy/Sell",
    code: `// Buy when price < 100, sell > 110
return dates.map((date, i) => {
  if (prices[i] < 100) return { type: "BUY", price: prices[i], date };
  if (prices[i] > 110) return { type: "SELL", price: prices[i], date };
  return null;
}).filter(Boolean);`,
  },
  {
    name: "Buy Every 5th",
    code: `// Buy every 5th day, sell every 10th
return dates.map((date, i) => {
  if (i % 10 === 0) return { type: "SELL", price: prices[i], date };
  if (i % 5 === 0) return { type: "BUY", price: prices[i], date };
  return null;
}).filter(Boolean);`,
  },
];

const CodeEditor = ({ value, onChange }) => {
  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" color="gray.500">
        Custom Strategy (JavaScript, use: prices[], dates[])
      </Text>

      <Box
        bg="gray.900"
        borderRadius="md"
        p={3}
        overflow="auto"
        maxH="300px"
        fontSize="sm"
        fontFamily="mono"
        color="white"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.700"
      >
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages.javascript)}
          padding={10}
          style={{
            fontFamily: '"Fira Code", monospace',
            fontSize: 14,
            backgroundColor: "transparent",
            minHeight: "200px",
          }}
        />
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.400" mb={1}>
          💡 Try an Example Strategy:
        </Text>
        <HStack spacing={3}>
          {exampleStrategies.map((ex) => (
            <Button
              key={ex.name}
              size="sm"
              variant="outline"
              onClick={() => onChange(ex.code)}
            >
              {ex.name}
            </Button>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
};

export default CodeEditor;
