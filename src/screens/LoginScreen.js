import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { loginThunk } from '../redux/authSlice';

const showMessage = (msg) => {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('Info', msg);
};

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email || !password)
      return showMessage('Please enter email and password');
    
    const resultAction = await dispatch(loginThunk({ email, password }));
    if (loginThunk.rejected.match(resultAction)) {
      showMessage(resultAction.payload || 'Login failed');
    } else {
      showMessage('Login successful');
      navigation.replace('HomeScreen');
      // navigation.replace('Main');
    }
  };

  return (
    <View style={styles.container}>
      <Loader visible={loading} />
      <Text style={styles.title}>Login</Text>
      <CustomInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Enter Email"
      />
      <CustomInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter Password"
      />
      <CustomButton title="Login" onPress={onLogin} loading={loading} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}
        style={{ marginTop: 16 }}
      >
        <Text style={{ textAlign: 'center' }}>Go to Signup</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
});

export default LoginScreen;
