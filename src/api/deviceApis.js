import { useSelector } from 'react-redux';
import api, { request, apiPrimary } from './api';

export const getConfig = async () => {
  const res = await request({
    url: '/api/config_mode',
    method: 'GET',
    useSecondary: false,
  });
  return res.data;
};

export const getEnrolledDevices = async () => {
  const res = await request({
    url: '/api/enrollments',
    method: 'GET',
    useSecondary: false,
  });
  return res.data;
};

export const postEnrolledDevice = async (data) => {
  const res = await request({
    url: '/api/enrollment',
    method: 'POST',
    data,
    useSecondary: false,
  });
  return res.data;
};

export const createRoom = async (formData) => {
  const res = await apiPrimary.post('/api/rooms', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getDummyMqttData = async (mqttTopic) => {
  const res = await request({
    url: '/api/test/dummy-mqtt-data',
    method: 'POST',
    data: { mqtt_topic: mqttTopic },
    useSecondary: false,
  });
  return res.data;
};

export const visualizeRoom = async (roomId, mqttTopic) => {
  const res = await request({
    url: '/api/visualize',
    method: 'POST',
    data: {
      room_id: roomId,
      mqtt_topic: mqttTopic,
    },
    useSecondary: false,
  });
  return res.data;
};
