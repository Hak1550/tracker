import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Track with Confidence',
    subtitle: 'Monitor your devices in real-time with pinpoint accuracy.',
  },
  {
    key: '2',
    title: 'Secure Surveillance',
    subtitle: 'Your data is encrypted and protected at every step.',
  },
  {
    key: '3',
    title: 'Stay in Control',
    subtitle: 'Get instant alerts and manage all devices from one place.',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const ref = useRef(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <CustomButton
          title="Get Started"
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { width, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center' },
  footer: { padding: 20 },
});

export default OnboardingScreen;
