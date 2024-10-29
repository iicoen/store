import React from "react";
import { motion } from "framer-motion";
import "../css/HomePage.css";

const HomePage = () => {
  return (
    <div className="page">
      {/* רקעים מתחלפים */}
      <div className="background background1"></div>
      <div className="background background2"></div>

      <div className="container">
        <motion.h1 
          className="header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          ברוכים הבאים לחווית קניות חדשה
        </motion.h1>

        <motion.p 
          className="text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          כאן תמצאו את כל מה שאתם צריכים במקום אחד, עם חווית משתמש מתקדמת ואינטואיטיבית.
        </motion.p>

        <motion.button 
          className="button"
          whileTap={{ scale: 0.9 }}
        >
          התחילו לקנות עכשיו
        </motion.button>

        <motion.div 
          className="offerBox"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <h3>מבצעים חמים!</h3>
          <p>מבצעים והנחות מיוחדים שמחכים רק לכם!</p>
        </motion.div>

        {/* סקשנים נוספים עם הנפשות וגלילה */}
        <motion.div
          className="scrollSection"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1 }}
        >
          <h2>מוצרים בלעדיים</h2>
          <p>מוצרים חדשים ומיוחדים שמחכים לכם כאן באתר.</p>
        </motion.div>

        <motion.div
          className="scrollSection"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1 }}
        >
          <h2>חווית קנייה מותאמת אישית</h2>
          <p>אנחנו מתאימים את המוצרים וההצעות בדיוק בשבילכם!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
