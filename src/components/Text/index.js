import React from 'react';
import {StyleSheet, Text} from 'react-native';
import { Colors } from '../../utils/colors';


const CustomText = ({style, text, numberOfLines, color}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles.text, style, {color: color ?? Colors.blackColor}]}>
      {text}
    </Text>
  );
};
const styles = StyleSheet.create({
  text: {
    marginTop: 1,
    color: Colors.blackColor,
  },
});

export default CustomText;
