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
import DateTimePicker from '@react-native-community/datetimepicker';
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
  updateRoomThunk,
  getDummyMqttDataThunk,
  getRoomByIdThunk,
  visualizeRoomThunk,
  getMqttHistoryThunk,
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
  const [isEditRoomMode, setIsEditRoomMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyDate, setHistoryDate] = useState('');
  const [historyHour, setHistoryHour] = useState(null); // null = full day, 0-23 = specific hour
  const [historyMinute, setHistoryMinute] = useState(null); // null = whole hour, 0-59 = specific minute
  const [historyTagId, setHistoryTagId] = useState(''); // optional filter, e.g. "1"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);
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
      // Real data path (API docs): when device has a room, use its room_id only.
      // Do not call dummy MQTT — POST /api/visualize and WebSocket use data from
      // POST /api/mqtt/data (real device data).
      let roomId = selectedDevice?.room?.room_id;
      if (!roomId) {
        // Fallback: only when room_id is missing (e.g. device not bound to a room)
        const dummyResult = await dispatch(
          getDummyMqttDataThunk(selectedDevice?.mqtt_topic)
        );
        if (getDummyMqttDataThunk.rejected.match(dummyResult)) {
          showMessage(dummyResult.payload || 'Failed to get room info');
          setLoading(false);
          return;
        }
        roomId = dummyResult.payload?.data?.room_id;
      }

      if (!roomId) {
        showMessage('Room ID not found. Please create a room first.');
        setLoading(false);
        return;
      }

      const roomResult = await dispatch(getRoomByIdThunk(roomId));
      if (getRoomByIdThunk.rejected.match(roomResult)) {
        showMessage(roomResult.payload || 'Failed to get room data');
        setLoading(false);
        return;
      }

      // POST /api/visualize uses stored real data (from POST /api/mqtt/data)
      const visualizeResult = await dispatch(
        visualizeRoomThunk({
          roomId: roomId,
          mqttTopic: selectedDevice?.mqtt_topic,
        })
      );
      
      if (visualizeRoomThunk.fulfilled.match(visualizeResult)) {
        navigation.navigate('VisualizeRoom', {
          visualizeData: visualizeResult.payload?.data,
          roomData: roomResult.payload?.data,
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
    setIsEditRoomMode(false);
    setEditingRoomId(null);
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

  const handleEditDevice = async () => {
    setDeviceOptionsModal(false);
    if (!selectedDevice) return;
    const roomId = selectedDevice?.room?.room_id;
    if (roomId) {
      setLoading(true);
      try {
        const roomResult = await dispatch(getRoomByIdThunk(roomId));
        if (getRoomByIdThunk.fulfilled.match(roomResult)) {
          const r = roomResult.payload?.data?.data ?? roomResult.payload?.data ?? {};
          setRoomData({
            A0_A1: String(r.A0_A1 ?? r.a0_a1 ?? ''),
            A1_A2: String(r.A1_A2 ?? r.a1_a2 ?? ''),
            A2_A3: String(r.A2_A3 ?? r.a2_a3 ?? ''),
            A3_A0: String(r.A3_A0 ?? r.a3_a0 ?? ''),
            label: r.label ?? selectedDevice?.room?.label ?? '',
            mqtt_topic: r.mqtt_topic ?? selectedDevice?.mqtt_topic ?? '',
            image: r.image_url ? { uri: r.image_url } : r.image || null,
          });
          setIsEditRoomMode(true);
          setEditingRoomId(roomId);
          setCreateRoomModal(true);
        } else {
          showMessage(roomResult.payload || 'Failed to load room');
        }
      } catch (err) {
        console.error('Edit room load error:', err);
        showMessage('Failed to load room');
      } finally {
        setLoading(false);
      }
    } else {
      setDeviceData({
        deviceName: selectedDevice.deviceName || '',
        wifiName: selectedDevice.mobile_ssid || '',
        password: '',
      });
      setModalVisible(true);
    }
  };

  const handleDeleteDevice = () => {
    setDeviceOptionsModal(false);
    console.log('selectedDevice',selectedDevice);
    
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${selectedDevice?.room?.label} room?`,
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
            showMessage(`${selectedDevice?.room?.label} deleted`);
            // dispatch(deleteDeviceThunk(selectedDevice.id));
            getEnrolledDevices();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleHistory = () => {
    setDeviceOptionsModal(false);
    setHistoryDate('');
    setHistoryHour(null);
    setHistoryMinute(null);
    setHistoryTagId('');
    setHistoryModalVisible(true);
  };

  const handleHistorySubmit = async () => {
    const date = historyDate.trim();
    if (!date) {
      showMessage('Please select date');
      return;
    }
    setLoading(true);
    try {
      const params = { date };
      if (historyHour != null && historyHour >= 0 && historyHour <= 23) {
        params.hour = historyHour;
        if (historyMinute != null && historyMinute >= 0 && historyMinute <= 59) {
          params.minute = historyMinute;
        }
      }
      const tagIdVal = historyTagId.trim();
      if (tagIdVal !== '') {
        const n = parseInt(tagIdVal, 10);
        if (!Number.isNaN(n)) params.tag_id = n;
      }
      const result = await dispatch(
        getMqttHistoryThunk({
          mqttTopic: selectedDevice?.mqtt_topic,
          params,
        }),
      );
      if (getMqttHistoryThunk.fulfilled.match(result)) {
        setHistoryModalVisible(false);
        setHistoryDate('');
        setHistoryHour(null);
        setHistoryMinute(null);
        setHistoryTagId('');
        navigation.navigate('HistoryVisualize', {
          historyResponse: result.payload?.data,
          roomLabel: selectedDevice?.room?.label,
        });
      } else {
        showMessage(result.payload || 'Failed to load history');
      }
    } catch (err) {
      console.error('History load error:', err);
      showMessage('Failed to load history');
    } finally {
      setLoading(false);
    }
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
      const formData = new FormData();
      formData.append('A0_A1', roomData.A0_A1);
      formData.append('A1_A2', roomData.A1_A2);
      formData.append('A2_A3', roomData.A2_A3);
      formData.append('A3_A0', roomData.A3_A0);
      formData.append('label', roomData.label);
      formData.append('mqtt_topic', roomData.mqtt_topic);

      if (roomData.image && roomData.image.uri) {
        formData.append('image', {
          uri: roomData.image.uri,
          type: roomData.image.type || 'image/jpeg',
          name: roomData.image.fileName || 'image.jpg',
        });
      }

      if (isEditRoomMode && editingRoomId) {
        const resultAction = await dispatch(
          updateRoomThunk({ roomId: editingRoomId, formData }),
        );
        if (updateRoomThunk.fulfilled.match(resultAction)) {
          showMessage('Room updated successfully');
          setCreateRoomModal(false);
          setIsEditRoomMode(false);
          setEditingRoomId(null);
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
          showMessage(resultAction.payload || 'Failed to update room');
        }
      } else {
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
      }
    } catch (err) {
      console.error('Room submit error:', err);
      showMessage(isEditRoomMode ? 'Failed to update room' : 'Failed to create room');
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
            {item.room?.label ?? 'Room Name'}
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

  console.log('api status', enrollDevices, );

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
        onHistory={handleHistory}
      />

      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>History – Select date</Text>

            <Text style={[styles.modalTitle, { fontSize: 14, marginBottom: 4 }]}>
              Date (required)
            </Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', minHeight: 48 }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: historyDate ? Colors.blackColor : Colors.mediumGrayColor,
                }}
              >
                {historyDate || 'Tap to pick date'}
              </Text>
            </TouchableOpacity>

            {historyDate ? (
              <>
                <Text style={[styles.modalTitle, { fontSize: 14, marginBottom: 4, marginTop: 12 }]}>
                  Hour (optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    { justifyContent: 'center', minHeight: 48 },
                    historyHour != null && { borderColor: Colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setShowHourPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: historyHour != null ? Colors.blackColor : Colors.mediumGrayColor,
                    }}
                  >
                    {historyHour != null ? `Hour ${historyHour}` : 'Tap to pick hour'}
                  </Text>
                </TouchableOpacity>

                {historyHour != null ? (
                  <>
                    <Text style={[styles.modalTitle, { fontSize: 14, marginBottom: 4, marginTop: 12 }]}>
                      Minute (optional)
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        { justifyContent: 'center', minHeight: 48 },
                        historyMinute != null && { borderColor: Colors.primary, borderWidth: 2 },
                      ]}
                      onPress={() => setShowMinutePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: historyMinute != null ? Colors.blackColor : Colors.mediumGrayColor,
                        }}
                      >
                        {historyMinute != null ? `Minute ${historyMinute}` : 'Tap to pick minute'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}

                <Text style={[styles.modalTitle, { fontSize: 14, marginBottom: 4, marginTop: 12 }]}>
                  Tag ID (optional)
                </Text>
                <CustomInput
                  value={historyTagId}
                  onChangeText={setHistoryTagId}
                  placeholder="e.g. 1 – leave empty for all tags"
                  keyboardType="number-pad"
                  style={{ marginBottom: 0 }}
                />
              </>
            ) : null}

            {showDatePicker && (
              <>
                <DateTimePicker
                  value={historyDate ? dayjs(historyDate).toDate() : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                      if (event.type === 'set' && date) {
                        setHistoryDate(dayjs(date).format('YYYY-MM-DD'));
                      }
                    } else if (date) {
                      setHistoryDate(dayjs(date).format('YYYY-MM-DD'));
                    }
                  }}
                  maximumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={{ marginTop: 8, padding: 12, backgroundColor: Colors.primary, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {showHourPicker && (
              <>
                <DateTimePicker
                  value={new Date(2000, 0, 1, historyHour ?? 0, historyMinute ?? 0)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') {
                      setShowHourPicker(false);
                      if (event.type === 'set' && date) {
                        setHistoryHour(date.getHours());
                        setHistoryMinute(date.getMinutes());
                      }
                    } else if (date) {
                      setHistoryHour(date.getHours());
                      setHistoryMinute(date.getMinutes());
                    }
                  }}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={{ marginTop: 8, padding: 12, backgroundColor: Colors.primary, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setShowHourPicker(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {showMinutePicker && (
              <>
                <DateTimePicker
                  value={new Date(2000, 0, 1, historyHour ?? 0, historyMinute ?? 0)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') {
                      setShowMinutePicker(false);
                      if (event.type === 'set' && date) {
                        setHistoryMinute(date.getMinutes());
                      }
                    } else if (date) {
                      setHistoryMinute(date.getMinutes());
                    }
                  }}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={{ marginTop: 8, padding: 12, backgroundColor: Colors.primary, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setShowMinutePicker(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}
            >
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setHistoryModalVisible(false);
                  setShowDatePicker(false);
                  setShowHourPicker(false);
                  setShowMinutePicker(false);
                }}
                cancel
              />
              <CustomButton
                title="Load history"
                onPress={handleHistorySubmit}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>

      <CreateRoomModal
        visible={createRoomModal}
        onClose={() => {
          setCreateRoomModal(false);
          setIsEditRoomMode(false);
          setEditingRoomId(null);
        }}
        roomData={roomData}
        onRoomDataChange={setRoomData}
        onSubmit={handleCreateRoomSubmit}
        loading={loading}
        showMessage={showMessage}
        initialMqttTopic={selectedDevice?.mqtt_topic || ''}
        isEditMode={isEditRoomMode}
      />
    </View>
  );
};

export default HomeScreen;
