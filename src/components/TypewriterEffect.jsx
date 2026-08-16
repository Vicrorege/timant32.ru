import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { useTranslation } from 'react-i18next';

const TypewriterEffect = () => {
  const { t, i18n } = useTranslation(); 

  const animationSequence = [
    t('phrase1'), 1500,
    t('phrase2'), 1500,
    t('phrase3'), 1500,
    t('phrase4'), 1500,
    '', 500, 
  ];

  return (
    <div className="typewriter-container">
      <TypeAnimation
        key={i18n.language} 
        
        sequence={animationSequence} 
        wrapper="span" 
        speed={70} 
        repeat={Infinity} 
        className="typing-text" 
        cursor={true} 
      />
    </div>
  );
};

export default TypewriterEffect;