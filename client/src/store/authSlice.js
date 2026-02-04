import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "@/services/authService";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  isCheckingAuth: true, // New flag for initial load
  error: null,
};

/*
|--------------------------------------------------------------------------
| fetchUser (runs on reload)
|--------------------------------------------------------------------------
*/
export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const data = await authAPI.getCurrentUser();
    return data.user;
  } catch (err) {
    return rejectWithValue(err?.message || "Auth failed");
  }
});

/*
|--------------------------------------------------------------------------
| login
|--------------------------------------------------------------------------
*/
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await authAPI.login(credentials);
    return data.user;
  } catch (err) {
    return rejectWithValue(err?.message || "Login failed");
  }
});

/*
|--------------------------------------------------------------------------
| signup
|--------------------------------------------------------------------------
*/
export const signup = createAsyncThunk("auth/signup", async (userData, { rejectWithValue }) => {
  try {
    const data = await authAPI.register(userData);
    return data.user;
  } catch (err) {
    return rejectWithValue(err?.message || "Signup failed");
  }
});

/*
|--------------------------------------------------------------------------
| logout
|--------------------------------------------------------------------------
*/
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
    return null;
  } catch (err) {
    return rejectWithValue(err?.message || "Logout failed");
  }
});

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | FETCH USER
    |--------------------------------------------------------------------------
    */
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      });

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null; // clear old error
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload; // Always a string now
      })

      /*
    |--------------------------------------------------------------------------
    | SIGNUP
    |--------------------------------------------------------------------------
    */
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })

      /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
