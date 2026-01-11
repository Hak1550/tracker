// utils/responsive.js
import {Dimensions, PixelRatio} from 'react-native';

const {width, height} = Dimensions.get('window');

const guidelineBaseWidth = 375; // base iPhone X width
const guidelineBaseHeight = 812; // base iPhone X height

export const scale = size => (width / guidelineBaseWidth) * size;

export const verticalScale = size => (height / guidelineBaseHeight) * size;

export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const responsiveFont = size =>
  PixelRatio.roundToNearestPixel(moderateScale(size));

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
