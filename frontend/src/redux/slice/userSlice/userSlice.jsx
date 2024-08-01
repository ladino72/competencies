// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: '', // Initially empty until the teacher selects a role
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUseR(state, action) {
            state.user = action.payload;
        },
    },
});

export const { setUseR } = userSlice.actions;
export default userSlice.reducer;
