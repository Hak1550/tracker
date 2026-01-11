import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getConfig,
  getEnrolledDevices,
  postEnrolledDevice,
  createRoom,
  getDummyMqttData,
  visualizeRoom,
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

export const postEnrollDeviceThunk = createAsyncThunk(
  'api/enrollment',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await postEnrolledDevice(payload);
      console.log('postEnrollDeviceThunk', data);

      return { data: data || [] };
    } catch (e) {
      console.log('postEnrollDeviceThunk err', e);
      return rejectWithValue(
        e?.response?.data?.message || 'Something went wrong',
      );
    }
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
      });
  },
});

export default deviceSlice.reducer;
