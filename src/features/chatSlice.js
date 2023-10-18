import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	chats: [],
};

const chatSlice = createSlice({
	name: "chats",
	initialState,
	reducers: {
		setChats: (state, action) => {
			state.chats = action.payload;
		},
	},
});

export const { setChats } = chatSlice.actions;

export const selectChat = (state) => state.chats.chats;

export default chatSlice.reducer;
