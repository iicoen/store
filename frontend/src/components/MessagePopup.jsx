import React from "react";
import { motion } from "framer-motion";
import "../css/MessagePopup.css";

const MessagePopup = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      className="message-popup"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {message}
    </motion.div>
  );
};

export default MessagePopup;
