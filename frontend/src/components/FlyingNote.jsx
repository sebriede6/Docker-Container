
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FlyingNote.css'; 

const FlyingNote = ({ text, onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 4000); 

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  
  const targetX = Math.random() * (window.innerWidth / 2) - (window.innerWidth / 4) + 'px';
  const targetY = Math.random() * 100 + 50 + 'px'; 
  const rotation = Math.random() * 30 - 15; 

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flying-note-container"
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            y: targetY,
            x: targetX,
            scale: 1,
            rotate: rotation,
            transition: { type: 'spring', stiffness: 50, damping: 10, duration: 1.5 },
          }}
          exit={{
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.5 },
          }}
        >
          <div className="note-paper">
            <div className="pin"></div>
            <p>{text.substring(0, 20)}{text.length > 20 ? '...' : ''}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlyingNote;