import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],

}


const messageSlice = createSlice({
    name:"message",
    initialState,
    reducers:{
        setmessages : (state,action) => {
            state.messages = action.payload
        }
    }
})

export const {setmessages} = messageSlice.actions
export default messageSlice.reducer

