import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "@/services/auth.service";
import { USER_PROFILE_MESSAGES } from "@/helpers/constants";
import { logError } from "@/helpers/utils";
import { bootstrapNotifications } from "./notification.slice";

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
export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, { dispatch, rejectWithValue }) => {
  try {
    const data = await authAPI.getCurrentUser();
    dispatch(bootstrapNotifications());
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
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await authAPI.login(credentials);
      dispatch(bootstrapNotifications());
      return data.user;
    } catch (err) {
      return rejectWithValue(err?.message || "Login failed");
    }
  },
);

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
| updateProfile
|--------------------------------------------------------------------------
*/
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authAPI.updateProfile(userData);
      return data.user;
    } catch (err) {
      logError(err);
      return rejectWithValue(USER_PROFILE_MESSAGES.UPDATE_FAILED);
    }
  },
);

/*
|--------------------------------------------------------------------------
| changePassword
|--------------------------------------------------------------------------
*/
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await authAPI.changePassword(passwordData);
      return data.user;
    } catch (err) {
      logError(err);
      return rejectWithValue(USER_PROFILE_MESSAGES.PASSWORD_FAILED);
    }
  },
);

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
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
