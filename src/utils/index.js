import { Platform, ToastAndroid, Alert } from 'react-native';

export const notify = message => {
  if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
  else Alert.alert('Info', message);
};


