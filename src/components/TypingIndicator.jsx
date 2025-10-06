import React from "react";
import { motion } from "framer-motion";

const TypingIndicator = () => {
  const dotTransition = {
    repeat: Infinity,
    ease: "easeInOut",
    duration: 1,
  };

  return (
    <motion.div
      className="flex items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.span
        className="h-2 w-2 rounded-full bg-current"
        animate={{ y: [0, -4, 0] }}
        transition={{ ...dotTransition, delay: 0 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-current"
        animate={{ y: [0, -4, 0] }}
        transition={{ ...dotTransition, delay: 0.2 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-current"
        animate={{ y: [0, -4, 0] }}
        transition={{ ...dotTransition, delay: 0.4 }}
      />
    </motion.div>
  );
};

export default TypingIndicator;
