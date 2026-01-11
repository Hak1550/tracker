import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

const CustomInput = ({ label, error, style, onChangeText, ...rest }) => (
  <View style={[styles.container, style]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      style={[styles.input, error ? styles.errorBorder : null]}
      placeholderTextColor="#999"
      autoCapitalize="none"
      onChangeText={onChangeText}
      {...rest}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  errorBorder: { borderColor: '#ff6b6b' },
  errorText: { marginTop: 6, color: '#ff6b6b' },
});

export default CustomInput;
