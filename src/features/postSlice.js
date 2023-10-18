import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: []
}

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload
        }
    }
})

export const {setPosts} = postSlice.actions

export const selectPost = state => state.posts.posts;

export default postSlice.reducer