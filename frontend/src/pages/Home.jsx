import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import TickerBar from "../components/TickerBar";
import NewsFeed from "../components/NewsFeed";
import IndexCards from "../components/Indexcards";

const Home = () => {
  return (
    <>
      <TickerBar />
      <IndexCards />
      <NewsFeed />
    </>
  );
};

export default Home;
