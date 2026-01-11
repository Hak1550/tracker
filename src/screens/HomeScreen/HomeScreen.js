import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { styles } from './styles';
import { Colors } from '../../utils/colors';
import EmptyModal from '../../components/EmptyModal';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import CustomHeader from '../../components/CustomHeader';
import DeviceOptionsModal from '../../components/DeviceOptionsModal';
import CreateRoomModal from '../../components/CreateRoomModal';
import { images } from '../../assets/images/images';
import NetInfo from '@react-native-community/netinfo';

import {
  getConfigThunk,
  getEnrollDevicesThunk,
  postEnrollDeviceThunk,
  createRoomThunk,
  getDummyMqttDataThunk,
  visualizeRoomThunk,
} from '../../redux/deviceSlice';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import SmartImage from '../../components/SmartImage';
import { logout } from '../../redux/authSlice';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { enrollDevices, newDeviceConfig } = useSelector(
    (state) => state.device,
  );

  const [deviceData, setDeviceData] = useState({
    deviceName: '',
    wifiName: '',
    password: '',
  });
  // console.log('deviceData', deviceData, enrollDevices);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [connectionModal, setConnectionModal] = useState(false);
  const [deviceOptionsModal, setDeviceOptionsModal] = useState(false);
  const [createRoomModal, setCreateRoomModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [roomData, setRoomData] = useState({
    A0_A1: '',
    A1_A2: '',
    A2_A3: '',
    A3_A0: '',
    label: '',
    mqtt_topic: '',
    image: null,
  });
  const [fields] = useState([
    {
      title: 'Device Name',
      key: 'deviceName',
      secure: false,
    },
    {
      title: 'Wifi Name',
      key: 'wifiName',
      secure: false,
    },
    {
      title: 'Wifi Password',
      key: 'password',
      secure: true,
    },
  ]);

  const showMessage = (msg) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert('Info', msg);
  };
  const getEnrolledDevices = async () => {
    const resultAction = await dispatch(getEnrollDevicesThunk());
  };
  const getConfigDevice = async () => {
    const resultAction = await dispatch(getConfigThunk());
  };

  const openFormModal = async () => {
    setLoading(true);

    // setModalVisible(true);
    // getConfigDevice();

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort(); // ⛔ stop the request
    }, 60 * 1000); // 1 minute timeout

    try {
      const res = await fetch('http://192.168.4.1/status', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        // setDeviceData((prev) => ({ ...prev, ...json }));
        setModalVisible(true);
        setTimeout(() => {}, 10000);

        showMessage('Device connected successfully');
        setConnectionModal(false);
      } catch (e) {
        console.log('⚠️ Invalid JSON:', e);
        Alert.alert('Received invalid data from device.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setConnectionModal(false);
        Alert.alert('⏰ Request timed out. Device not responding.');
      } else {
        Alert.alert('❌ Failed to connect to device. Please try again.');
        console.log('Fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevicePress = (item) => {
    setSelectedDevice(item);
    setDeviceOptionsModal(true);
  };

  const handleOpenDevice = async () => {
    setDeviceOptionsModal(false);
    setLoading(true);
    
    try {
      // Step 1: Call dummy-mqtt-data API
      const dummyResult = await dispatch(
        getDummyMqttDataThunk(selectedDevice?.mqtt_topic)
      );
      
      if (getDummyMqttDataThunk.rejected.match(dummyResult)) {
        showMessage(dummyResult.payload || 'Failed to get dummy mqtt data');
        setLoading(false);
        return;
      }

      // Get room_id from device or response
      // The room_id should be in the device object if it has a bound room
      const roomId = selectedDevice?.room?.room_id || dummyResult.payload?.data?.room_id;

      console.log('roomId', roomId,selectedDevice,dummyResult);
      
      if (!roomId) {
        showMessage('Room ID not found. Please create a room first.');
        setLoading(false);
        return;
      }

      // Step 2: Call visualize API
      const visualizeResult = await dispatch(
        visualizeRoomThunk({
          roomId: roomId,
          mqttTopic: selectedDevice?.mqtt_topic,
        })
      );

      if (visualizeRoomThunk.fulfilled.match(visualizeResult)) {
        navigation.navigate('VisualizeRoom', {
          visualizeData: visualizeResult.payload?.data,
        });
      } else {
        showMessage(visualizeResult.payload || 'Failed to visualize room');
      }
    } catch (err) {
      console.error('Open device error:', err);
      showMessage('Failed to open device');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    setDeviceOptionsModal(false);
    // Reset and pre-fill mqtt_topic from selected device
    setRoomData({
      A0_A1: '',
      A1_A2: '',
      A2_A3: '',
      A3_A0: '',
      label: '',
      mqtt_topic: selectedDevice?.mqtt_topic || '',
      image: null,
    });
    setCreateRoomModal(true);
  };

  const handleEditDevice = () => {
    setDeviceOptionsModal(false);
    // TODO: Open edit modal with device data pre-filled
    if (selectedDevice) {
      setDeviceData({
        deviceName: selectedDevice.deviceName || '',
        wifiName: selectedDevice.mobile_ssid || '',
        password: '', // Don't pre-fill password for security
      });
      setModalVisible(true);
    }
  };

  const handleDeleteDevice = () => {
    setDeviceOptionsModal(false);
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${selectedDevice?.deviceName}?`,
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // TODO: Call delete API
            showMessage(`${selectedDevice?.deviceName} deleted`);
            // dispatch(deleteDeviceThunk(selectedDevice.id));
            getEnrolledDevices();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleCreateRoomSubmit = async () => {
    if (
      !roomData.A0_A1 ||
      !roomData.A1_A2 ||
      !roomData.A2_A3 ||
      !roomData.A3_A0 ||
      !roomData.label ||
      !roomData.mqtt_topic
    ) {
      return showMessage('Please fill all required fields');
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('A0_A1', roomData.A0_A1);
      formData.append('A1_A2', roomData.A1_A2);
      formData.append('A2_A3', roomData.A2_A3);
      formData.append('A3_A0', roomData.A3_A0);
      formData.append('label', roomData.label);
      formData.append('mqtt_topic', roomData.mqtt_topic);
      
      if (roomData.image) {
        formData.append('image', {
          uri: roomData.image.uri,
          type: roomData.image.type || 'image/jpeg',
          name: roomData.image.fileName || 'image.jpg',
        });
      }

      const resultAction = await dispatch(createRoomThunk(formData));
      
      if (createRoomThunk.fulfilled.match(resultAction)) {
        showMessage('Room created successfully');
        setCreateRoomModal(false);
        setRoomData({
          A0_A1: '',
          A1_A2: '',
          A2_A3: '',
          A3_A0: '',
          label: '',
          mqtt_topic: selectedDevice?.mqtt_topic || '',
          image: null,
        });
        getEnrolledDevices();
      } else {
        showMessage(resultAction.payload || 'Failed to create room');
      }
    } catch (err) {
      console.error('Create room error:', err);
      showMessage('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleDevicePress(item)}
      activeOpacity={0.7}
    >
      {/* <Ionicons name={item.icon} size={24} color="#333" style={styles.deviceIcon} /> */}
      <View style={{ flexDirection: 'row' }}>
        <SmartImage
          source={images.wifi}
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
        <View>
          <Text style={styles.deviceName}>
            {item.deviceName ?? 'Device Name'}
          </Text>
          <Text style={styles.deviceDesc}>
            Enrolled on {dayjs(item.enrolled_at).format('DD-MMM-YYYY')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const waitForNetworkChange = (timeoutMs = 15000) => {
    return new Promise((resolve, reject) => {
      let timeout;
      let unsubscribe;

      timeout = setTimeout(() => {
        if (unsubscribe) unsubscribe(); // ✅ Unsubscribe is a function
        reject(new Error('Network change timeout'));
      }, timeoutMs);

      unsubscribe = NetInfo.addEventListener((state) => {
        if (
          state.isConnected &&
          state.type === 'wifi' &&
          !state.details?.ssid?.toLowerCase().includes('esp')
        ) {
          clearTimeout(timeout);
          if (unsubscribe) unsubscribe(); // ✅
          resolve();
        }
      });
    });
  };

  const handleAddDevice = async () => {
    if (
      !deviceData?.deviceName ||
      !deviceData?.password ||
      !deviceData?.wifiName
    ) {
      return showMessage('Please fill all fields');
    }

    setLoading(true);

    const data = {
      wifiSSID: deviceData?.wifiName,
      wifiPassword: deviceData?.password ?? '',
      deviceName:
        deviceData?.deviceName ?? `New Device ${enrollDevices.length + 1}`,
      mqttPort: newDeviceConfig?.port ?? 1883,
      mqttServer: '15.204.231.252',
      anchorIndex: '0',
      mqttUsername: newDeviceConfig?.mqtt_username ?? 'taha',
      mqttPassword: newDeviceConfig?.mqtt_password ?? 'taha',
      mqttTopic: newDeviceConfig?.mqtt_topic,
    };

    const data2 = {
      server_ip: data?.mqttServer,
      mqtt_username: data?.mqttUsername,
      mqtt_password: data?.mqttPassword,
      port: data?.mqttPort,
      mqtt_topic: data?.mqttTopic,
      mobile_ssid: data?.wifiSSID,
      mobile_passcode: data?.wifiPassword,
      deviceName: data?.deviceName,
    };

    try {
      const res = await fetch('http://192.168.4.1/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.log('Raw response:', text);
      }

      // ✅ Wait for Wi-Fi change
      await waitForNetworkChange(); // 👈 custom function below

      setTimeout(async () => {
        showMessage(json?.message || 'Device configured');
        setDeviceData({ deviceName: '', wifiName: '', password: '' });
        const resultAction = await dispatch(postEnrollDeviceThunk(data2));
        getEnrolledDevices();
        setModalVisible(false);
        setLoading(false);
      }, 20000);
    } catch (err) {
      setLoading(false);

      console.error('POST error:', err);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    getEnrolledDevices();
  }, []);

  const logoutAlertt = () => {
    Alert.alert('Logout', 'Are you sure want to logout?', [
      {
        text: 'No',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  // console.log('api status', deviceData, modalVisible);

  return (
    <View style={styles.container}>
      <CustomHeader
        title={`Hello User`}
        rightImage={images.logout}
        rightImagePress={logoutAlertt}
      />
      <FlatList
        data={enrollDevices}
        keyExtractor={(item) => item.mqtt_topic}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          getConfigDevice();
          setConnectionModal(true);
        }}
      >
        <Text style={{ color: '#fff', fontSize: 34 }}>+</Text>
      </TouchableOpacity>

      {/* Add Device Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Device</Text>
            {fields.map((field, ind) => {
              return (
                <CustomInput
                  key={ind}
                  label={field?.title}
                  placeholder={`Enter ${field?.title}`}
                  style={styles.input}
                  value={deviceData[field?.key]}
                  secureTextEntry={field.key === 'password'}
                  onChangeText={(text) =>
                    setDeviceData((prev) => ({ ...prev, [field?.key]: text }))
                  }
                />
              );
            })}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                cancel
              />
              <CustomButton
                title="Add Device"
                onPress={handleAddDevice}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>

      <EmptyModal
        visible={connectionModal}
        onPress={openFormModal}
        onHide={() => setConnectionModal(false)}
        image={images.wifi}
        buttonText={'Connected'}
        loading={loading}
        heading="Please connect to a device"
      />

      <DeviceOptionsModal
        visible={deviceOptionsModal}
        onClose={() => setDeviceOptionsModal(false)}
        device={selectedDevice}
        onOpen={handleOpenDevice}
        onCreateRoom={handleCreateRoom}
        onEdit={handleEditDevice}
        onDelete={handleDeleteDevice}
      />

      <CreateRoomModal
        visible={createRoomModal}
        onClose={() => setCreateRoomModal(false)}
        roomData={roomData}
        onRoomDataChange={setRoomData}
        onSubmit={handleCreateRoomSubmit}
        loading={loading}
        showMessage={showMessage}
        initialMqttTopic={selectedDevice?.mqtt_topic || ''}
      />
    </View>
  );
};

export default HomeScreen;
