import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

const SmartImage = ({
  style,
  resizeMode = 'contain',
  isCatItem,
  isBrandItem,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingErrored, setLoadingErrored] = useState(false);

  // Use useCallback to avoid unnecessary re-renders
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setLoadingErrored(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setLoadingErrored(true);
  }, []);

  return (
    <View style={{ position: 'relative' }}>
      <FastImage
        {...props}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        resizeMode={resizeMode}
        style={[{ height: 25, width: 25 }, style]}
      />
    </View>
  );
};

export default SmartImage;

const styles = StyleSheet.create({
  loadingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
