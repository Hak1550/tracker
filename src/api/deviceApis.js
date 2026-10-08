import api, { request, apiPrimary, getAuthToken } from './api';


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
  const token = getAuthToken();
  const url = `${apiPrimary.defaults.baseURL}api/rooms`;
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `${token}` } : {}),
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'Failed to create room';
    try {
      const json = JSON.parse(text);
      msg = json.msg || json.message || msg;
    } catch (_) {}
    const err = new Error(msg);
    err.response = { status: res.status, data: { msg: msg } };
    throw err;
  }
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    return {};
  }
};

/**
 * Real data path (per UWB API docs):
 * - Devices POST to POST /api/mqtt/data (no auth) → data is stored.
 * - POST /api/visualize and WebSocket (position_update) use that stored data.
 * Do not use dummy endpoint for visualization when device has a room.
 */
export const postMqttData = async (payload) => {
  const res = await request({
    url: '/api/mqtt/data',
    method: 'POST',
    data: {
      mqtt_topic: payload.mqtt_topic,
      device_id: payload.device_id,
      message: payload.message,
      timestamp: payload.timestamp,
    },
    useSecondary: false,
  });
  return res.data;
};

/**
 * Testing only: creates dummy MQTT records (API §4.5).
 * For real positions use: devices → POST /api/mqtt/data; then POST /api/visualize
 * and WebSocket use the same stored data. Call this only when room_id is unknown
 * (e.g. fallback to resolve room_id), not for opening visualization.
 */
export const getDummyMqttData = async (mqttTopic) => {
  const res = await request({
    url: '/api/test/dummy-mqtt-data',
    method: 'POST',
    data: { mqtt_topic: mqttTopic },
    useSecondary: false,
  });
  return res.data;
};

export const getRoomById = async (roomId) => {
  const res = await request({
    url: `/api/rooms/${roomId}`,
    method: 'GET',
    useSecondary: false,
  });
  return res.data;
};

export const updateRoom = async (roomId, formData) => {
  const token = getAuthToken();
  const url = `${apiPrimary.defaults.baseURL}api/rooms/${roomId}`;
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `${token}` } : {}),
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'Failed to update room';
    try {
      const json = JSON.parse(text);
      msg = json.msg || json.message || msg;
    } catch (_) {}
    const err = new Error(msg);
    err.response = { status: res.status, data: { msg: msg } };
    throw err;
  }
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    return {};
  }
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

/**
 * GET /api/mqtt/data/{mqtt_topic}/history/by-date
 * Query params: date (YYYY-MM-DD, required), hour (0-23, optional), minute (0-59, optional), tag_id (optional).
 * date only → full day; date + hour → 1-hour window; date + hour + minute → 1-minute window (e.g. 11:45–11:45:59).
 */
export const getMqttHistory = async (mqttTopic, params = {}) => {
  const query = new URLSearchParams();
  if (!params.date) throw new Error('date is required');
  query.append('date', params.date);
  if (params.hour != null && params.hour >= 0 && params.hour <= 23) {
    query.append('hour', params.hour);
  }
  if (params.minute != null && params.minute >= 0 && params.minute <= 59) {
    query.append('minute', params.minute);
  }
  if (params.tag_id != null && params.tag_id !== '') {
    const tagId = typeof params.tag_id === 'number' ? params.tag_id : parseInt(params.tag_id, 10);
    if (!Number.isNaN(tagId)) query.append('tag_id', tagId);
  }
  const qs = query.toString();
  const url = `/api/mqtt/data/${encodeURIComponent(mqttTopic)}/history/by-date?${qs}`;
  console.log('url', url);
  const res = await request({
    url,
    method: 'GET',
    useSecondary: false,
  });
  return res.data;
};
