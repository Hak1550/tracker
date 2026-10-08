import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getConfig,
  getEnrolledDevices,
  postEnrolledDevice,
  createRoom,
  updateRoom,
  getDummyMqttData,
  getRoomById,
  visualizeRoom,
  getMqttHistory,
} from '../api/deviceApis';

export const getConfigThunk = createAsyncThunk(
  'api/config_mode',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getConfig();
      return { data: data || {} };
    } catch (e) {
      console.log('getConfigThunk err', e);

      return rejectWithValue(e?.data?.message || 'Something went wrong');
    }
  },
);

export const getEnrollDevicesThunk = createAsyncThunk(
  'api/enrollments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEnrolledDevices(); // No payload
      console.log('getEnrollDevicesThunk ', data);
      return { data: data || [] };
    } catch (e) {
      console.log('getEnrollDevicesThunk err', e);

      return rejectWithValue(
        e?.response?.data?.message || 'Something went wrong',
      );
    }
  },
);

const isNetworkError = (e) =>
  e?.status === 0 ||
  e?.data?.message === 'Network Error' ||
  e?.message === 'Network Error';

const MAX_NETWORK_RETRIES = 10; // 1 initial + 2 retries = 3 attempts total

export const postEnrollDeviceThunk = createAsyncThunk(
  'api/enrollment',
  async (payload, { rejectWithValue }) => {
    let lastError;
    for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES + 1; attempt++) {
      try {
        const data = await postEnrolledDevice(payload);
        console.log('postEnrollDeviceThunk', data);
        return { data: data || [] };
      } catch (e) {
        lastError = e;
        console.log(`postEnrollDeviceThunk err (attempt ${attempt})`, e);
        const shouldRetry =
          attempt <= MAX_NETWORK_RETRIES && isNetworkError(e);
        if (!shouldRetry) {
          return rejectWithValue(
            e?.response?.data?.message ||
              e?.data?.message ||
              'Something went wrong',
          );
        }
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    return rejectWithValue(
      lastError?.response?.data?.message ||
        lastError?.data?.message ||
        'Something went wrong',
    );
  },
);

export const createRoomThunk = createAsyncThunk(
  'api/createRoom',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createRoom(payload);
      console.log('createRoomThunk', data);
      return { data: data || {} };
    } catch (e) {
      console.log('createRoomThunk err', e);
      return rejectWithValue(
        e?.data?.msg || e?.response?.data?.msg || 'Something went wrong',
      );
    }
  },
);

export const getDummyMqttDataThunk = createAsyncThunk(
  'api/dummyMqttData',
  async (mqttTopic, { rejectWithValue }) => {
    try {
      const data = await getDummyMqttData(mqttTopic);
      console.log('getDummyMqttDataThunk', data);
      return { data: data || {} };
    } catch (e) {
      console.log('getDummyMqttDataThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || e?.response?.data?.msg || 'Something went wrong',
      );
    }
  },
);

export const updateRoomThunk = createAsyncThunk(
  'api/updateRoom',
  async ({ roomId, formData }, { rejectWithValue }) => {
    try {
      const data = await updateRoom(roomId, formData);
      console.log('updateRoomThunk', data,formData,roomId);
      return { data: data || {} };
    } catch (e) {
      console.log('updateRoomThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || e?.response?.data?.msg || 'Something went wrong',
      );
    }
  },
);

export const getRoomByIdThunk = createAsyncThunk(
  'api/getRoomById',
  async (roomId, { rejectWithValue }) => {
    try {
      const data = await getRoomById(roomId);
      console.log('getRoomByIdThunk', data);
      return { data: data || {} };
    } catch (e) {
      console.log('getRoomByIdThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || e?.response?.data?.msg || 'Something went wrong',
      );
    }
  },
);

export const visualizeRoomThunk = createAsyncThunk(
  'api/visualize',
  async ({ roomId, mqttTopic }, { rejectWithValue }) => {
    try {
      const data = await visualizeRoom(roomId, mqttTopic);
      console.log('visualizeRoomThunk', data);
      return { data: data || {} };
    } catch (e) {
      console.log('visualizeRoomThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || e?.response?.data?.msg || 'Something went wrong',
      );
    }
  },
);

export const getMqttHistoryThunk = createAsyncThunk(
  'api/mqttHistory',
  async ({ mqttTopic, params }, { rejectWithValue }) => {
    try {
      const data = await getMqttHistory(mqttTopic, params);
      console.log('getMqttHistoryThunk', data);
      return { data: data || {} };
    } catch (e) {
      console.log('getMqttHistoryThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || e?.response?.data?.msg || 'Failed to load history',
      );
    }
  },
);

const deviceSlice = createSlice({
  name: 'device',
  initialState: {
    loading: false,
    error: null,
    enrollDevices: [],
    newDeviceConfig: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConfigThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newDeviceConfig = action.payload?.data ?? {};
      })
      .addCase(getConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetching failed';
      })

      .addCase(getEnrollDevicesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnrollDevicesThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming data has devices or similar
        state.enrollDevices = action.payload?.data?.devices ?? [];
      })
      .addCase(getEnrollDevicesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetching failed';
      })
      .addCase(postEnrollDeviceThunk.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(postEnrollDeviceThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(postEnrollDeviceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Posting failed';
      })
      .addCase(createRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Creating room failed';
      })
      .addCase(updateRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Updating room failed';
      })
      .addCase(getDummyMqttDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDummyMqttDataThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getDummyMqttDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get dummy mqtt data';
      })
      .addCase(getRoomByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getRoomByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get room';
      })
      .addCase(visualizeRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(visualizeRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(visualizeRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to visualize room';
      })
      .addCase(getMqttHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMqttHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getMqttHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load history';
      });
  },
});

export default deviceSlice.reducer;
