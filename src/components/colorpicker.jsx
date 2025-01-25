import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ onChange }) => {
  const [color, setColor] = useState('#00ff00');

  const handleChangeComplete = (color) => {
    setColor(color.hex);
    onChange(color.hex);
  };

  return <SketchPicker color={color} onChangeComplete={handleChangeComplete} />;
};

export default ColorPicker;