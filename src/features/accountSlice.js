import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    accounts: []
}

const accountSlice = createSlice({
    name: "accounts",
    initialState,
    reducers: {
        setAccounts: (state, action) => {
            state.accounts = action.payload
        }
    }
})

export const {setAccounts} = accountSlice.actions

export const selectAccount = state => state.accounts.accounts

export default accountSlice.reducer;