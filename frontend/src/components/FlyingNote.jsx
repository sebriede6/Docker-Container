import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FlyingNote.css';

const PinIcon = () => (
  <svg className="pin-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3.00002C16 4.10002 15.1 5.00002 14 5.00002C12.9 5.00002 12 4.10002 12 3.00002C12 1.90002 12.9 1.00002 14 1.00002C15.1 1.00002 16 1.90002 16 3.00002Z" fill="#D32F2F"/>
    <path d="M14.5 12.5858L17.4142 15.5L15.5 17.4142L12.5858 14.5L12 15.0858V21C12 21.5523 11.5523 22 11 22C10.4477 22 10 21.5523 10 21V15.0858L9.41421 14.5L6.5 17.4142L4.58579 15.5L7.5 12.5858L7 12V5H9V12L9.58579 12.5L11 11.0858L12.4142 12.5L13 12V5H14.5V12.5858Z" fill="#BDBDBD"/>
  </svg>
);

const FlyingNote = ({ text, onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const animationDuration = 3000; 
    const visibleDuration = 1500; 

    const mainTimer = setTimeout(() => {
      setIsVisible(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, animationDuration + visibleDuration);

    return () => clearTimeout(mainTimer);
  }, [onAnimationComplete]);

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const targetXRange = [screenWidth * 0.2, screenWidth * 0.8];
  const targetYRange = [screenHeight * 0.05, screenHeight * 0.25];

  const targetX = Math.random() * (targetXRange[1] - targetXRange[0]) + targetXRange[0];
  const targetY = Math.random() * (targetYRange[1] - targetYRange[0]) + targetYRange[0];

  const finalRotation = Math.random() * 20 - 10;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flying-note-container"
          initial={{
            opacity: 0,
            x: screenWidth / 2 - 50,
            y: screenHeight * 0.6,
            scale: 0.3,
            rotate: Math.random() * 90 - 45,
          }}
          animate={{
            opacity: 1,
            x: targetX - 50,
            y: targetY - 50,
            scale: [0.3, 1.2, 1],
            rotate: [Math.random() * 90 - 45, finalRotation * 1.5, finalRotation],
            transition: {
              duration: 2.5,
              ease: "anticipate",
              scale: { duration: 0.5, times: [0, 0.8, 1] },
              rotate: { duration: 2, ease: "easeInOut", times: [0, 0.7, 1] },
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.7,
            y: targetY + 30,
            transition: { duration: 0.5, delay: 0.2 },
          }}
        >
          <div className="note-paper-visual">
            <div className="pin-area">
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  transition: { delay: 2.3, duration: 0.3, type: "spring", stiffness: 200 },
                }}
              >
                <PinIcon />
              </motion.div>
            </div>
            <p className="note-text-preview">
              {text.substring(0, 25)}{text.length > 25 ? '...' : ''}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlyingNote;
