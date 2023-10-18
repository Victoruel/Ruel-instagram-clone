import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/postSlice";
import userReducer from "../features/userSlice";
import accountReducer from "../features/accountSlice";
import chatReducer from "../features/chatSlice";

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		user: userReducer,
        accounts: accountReducer,
		chats: chatReducer
	},
});
