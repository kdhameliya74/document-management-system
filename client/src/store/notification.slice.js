import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import NotificationService from "@/services/notification.service";
import { logError } from "@/helpers/utils";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchPage",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await NotificationService.getNotifications(page, limit);
      return {
        notifications: data.notifications,
        hasMore: data.hasMore,
        unreadCount: data.unreadCount,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(err);
    }
  },
);

export const markOneRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id, { rejectWithValue }) => {
    try {
      await NotificationService.markOneRead(id);
      return id;
    } catch (err) {
      logError(err);
      return rejectWithValue(err);
    }
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.markAllRead();
    } catch (err) {
      logError(err);
      return rejectWithValue(err);
    }
  },
);

//TODO
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await NotificationService.deleteNotification(id);
      return id;
    } catch (err) {
      logError(err);
      return rejectWithValue(err);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
    ripple: false,
  },

  reducers: {
    // Called by socket middleware when a real-time notification arrives
    notificationReceived: (state, action) => {
      // Prepend and avoid duplicates
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.unreadCount += 1;
      }
    },

    // Sync missed notifications after socket reconnect
    syncMissed: (state, action) => {
      action.payload.forEach((notif) => {
        const exists = state.items.some((n) => n.id === notif.id);
        if (!exists) {
          state.items.push(notif);
          if (!notif.isRead) state.unreadCount += 1;
        }
      });
      state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    notifyByRipple: (state, action) => {
      state.ripple = action.payload;
    },
  },

  extraReducers: (builder) => {
    // fetchPage — infinite scroll
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      const { notifications, hasMore, unreadCount } = action.payload;
      const ids = new Set(state.items.map((n) => n.id));
      notifications.forEach((n) => {
        if (!ids.has(n.id)) state.items.push(n);
      });
      state.hasMore = hasMore;
      if (unreadCount !== undefined) {
        state.unreadCount = unreadCount;
      }
    });

    // markOneRead — optimistic already done by thunk, confirm on success
    builder.addCase(markOneRead.fulfilled, (state, action) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        notif.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // markAllRead
    builder.addCase(markAllRead.fulfilled, (state) => {
      state.items = state.items.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    });

    // delete
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.items = state.items.filter((n) => n.id !== action.payload);
    });
  },
});

export const { notificationReceived, syncMissed, notifyByRipple } = notificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectHasMore = (state) => state.notifications.hasMore;
export const selectNotifsLoading = (state) => state.notifications.loading;
export const selectRipple = (state) => state.notifications.ripple;

export default notificationSlice.reducer;
