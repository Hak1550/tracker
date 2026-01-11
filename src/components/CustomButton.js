import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const CustomButton = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  cancel
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      disabled ? styles.disabled : cancel ? styles.cancel : null,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={[styles.title, textStyle]}>{title ?? 'OK'}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1e90ff',
    // paddingVertical: 14,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  cancel: {
    backgroundColor: 'red',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;
