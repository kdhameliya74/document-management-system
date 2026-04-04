import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    activities: [],
};

const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {
        setActivities: (state, action) => {
            state.activities = action.payload;
        },
        addActivity: (state, action) => {
            state.activities.push(action.payload);
        },
    },
});

export const { setActivities, addActivity } = activitySlice.actions;
export default activitySlice.reducer;