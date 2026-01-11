import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, getUserData } from '../api/auth';
import { setAuthToken } from '../api/api';

const TOKEN_KEY = 'auth_token';

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
  console.log('hydrateAuth',token);
  let user = null;
  if (token) {
    try {
      user = await getUserData();
    } catch (e) {
      // invalid or expired token
      console.log('get user fail');

      // await AsyncStorage.removeItem(TOKEN_KEY);
      // setAuthToken(null);
    }
  }
  return { token: token || null, user };
});

export const loginThunk = createAsyncThunk(
  'api/login',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await loginUser(payload);

      const token = data?.token;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setAuthToken(token);
      }
      return { token, user: data?.user || null };
    } catch (e) {
      // const token = 'asd';
      // if (token) {
      //   await AsyncStorage.setItem(TOKEN_KEY, token);
      //   setAuthToken(token);
      // }
      return rejectWithValue(e?.data?.message || 'Login failed');
    }
  },
);

export const signupThunk = createAsyncThunk(
  'api/signup',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await registerUser(payload);
      const token = data?.token;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setAuthToken(token);
      }
      return { token, user: data?.user || null };
    } catch (e) {
      return rejectWithValue(e?.data?.message || 'Signup failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    loading: false,
    error: null,
    hydrated: false,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      AsyncStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.hydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
