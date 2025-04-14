const initialState = {
    user: {
      id: null,
      name: null,
      email: null,
      password: null,
      pendingList: [],
      contactList: [],
      token: null,
    },
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          user: {
            ...state.user,
            id: action.payload._id,
            name: action.payload.name,
            email: action.payload.email,
            password: action.payload.password,
            pendingList: action.payload.pendingList,
            contactList: action.payload.contactList,
            token: action.payload.token,
          },
        };
  
      case 'ADD_CONNECTION':
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [...state.user.contactList, action.payload],
          },
        };

      case 'ACCEPTED_REQUEST':
        return{
          ...state,
          user:{
            ...state.user,
            contactList:[...state.user.contactList,action.payload],
          }
        }
  
      case 'RECEIVED_REQUEST':
        return {
          ...state,
          user: {
            ...state.user,
            pendingList: [...state.user.pendingList, action.payload],
          },
        };
  
      case 'REMOVE_CONNECTION':
        return {
          ...state,
          user: {
            ...state.user,
            contactList: state.user.contactList.filter(
              contact => contact._id !== action.payload
            ),
          },
        };
  
      case 'REMOVE_PENDING_INVITE':
        return {
          ...state,
          user: {
            ...state.user,
            pendingList: state.user.pendingList.filter(
              pending => pending._id !== action.payload
            ),
          },
        };
  
      case 'MODIFY_USER_PHONE_NO': {
        const { id, phone } = action.payload;
        const userIndex = state.user.contactList.findIndex(
          contact => contact.id === id
        );
        if (userIndex === -1) return state;
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [
              ...state.user.contactList.slice(0, userIndex),
              { ...state.user.contactList[userIndex], phone },
              ...state.user.contactList.slice(userIndex + 1),
            ],
          },
        };
      }
  
      case 'MODIFY_USER_NAME': {
        const { id, name } = action.payload;
        const userIndex = state.user.contactList.findIndex(
          contact => contact.id === id
        );
        if (userIndex === -1) return state;
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [
              ...state.user.contactList.slice(0, userIndex),
              { ...state.user.contactList[userIndex], name },
              ...state.user.contactList.slice(userIndex + 1),
            ],
          },
        };
      }
  
      case 'MODIFY_PENDING_USER_PHONE_NO': {
        const { id, phone } = action.payload;
        const userIndex = state.user.pendingList.findIndex(
          pending => pending.id === id
        );
        if (userIndex === -1) return state;
        return {
          ...state,
          user: {
            ...state.user,
            pendingList: [
              ...state.user.pendingList.slice(0, userIndex),
              { ...state.user.pendingList[userIndex], phone },
              ...state.user.pendingList.slice(userIndex + 1),
            ],
          },
        };
      }
  
      case 'MODIFY_PENDING_USER_NAME': {
        const { id, name } = action.payload;
        const userIndex = state.user.pendingList.findIndex(
          pending => pending.id === id
        );
        if (userIndex === -1) return state;
        return {
          ...state,
          user: {
            ...state.user,
            pendingList: [
              ...state.user.pendingList.slice(0, userIndex),
              { ...state.user.pendingList[userIndex], name },
              ...state.user.pendingList.slice(userIndex + 1),
            ],
          },
        };
      }
  
      case 'LOGOUT':
        return {
          ...initialState,
        };
  
      default:
        return state;
    }
  };
  
export default userReducer;
  