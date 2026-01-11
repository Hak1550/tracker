import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { signupThunk } from '../redux/authSlice';

const showMessage = (msg) => {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('Info', msg);
};

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSignup = async () => {
    if (!name || !email || !password || !confirm)
      return showMessage('Please fill all fields');
    if (password !== confirm) return showMessage('Passwords do not match');

    const resultAction = await dispatch(signupThunk({ name, email, password }));
    if (signupThunk.rejected.match(resultAction)) {
      showMessage(resultAction.payload || 'Signup failed');
    } else {
    console.log('resultAction', resultAction);

      showMessage('Signup successful');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Loader visible={loading} />
      <Text style={styles.title}>Create Account</Text>
      <CustomInput
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter Name"
      />
      <CustomInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email}-address"
        placeholder="Enter Email"
      />
      <CustomInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        placeholder="Enter Password"
      />
      <CustomInput
        label="Confirm Password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry={true}
        placeholder="Re enter password"
      />
      <CustomButton title="Register" onPress={onSignup} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
});

export default SignupScreen;
