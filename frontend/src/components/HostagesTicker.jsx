import React, { useEffect, useRef } from 'react';

const HostagesTicker = () => {
  const tickerRef = useRef(null);

  useEffect(() => {
    if (tickerRef.current) {
      // שינוי הכיתוב לפני טעינת הסקריפט
      // tickerRef.current.innerHTML = "הכיתוב החדש כאן עם הקאונטר:";

      const script = document.createElement("script");
      script.type = "text/javascript";
      // script.src = "https://bringthemhomenow.net/1.1.0/hostages-ticker.js";
      // script.src = "./hostages-ticker-custom.js";
      // script.src = "https://drive.google.com/file/d/1o7XynajFvW1j1hLcTU_yrkzIWEHyCIk5/view?usp=sharing";
      script.src = "https://drive.google.com/uc?id=1o7XynajFvW1j1hLcTU_yrkzIWEHyCIk5&export=download";

      script.setAttribute(
        "integrity",
        "sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne"
      );
      script.setAttribute("crossorigin", "anonymous");

      // הוספת תג הסקריפט ל־<head> בדף
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return <div id="bthn" lang="he" ref={tickerRef}></div>;
};

export default HostagesTicker;
