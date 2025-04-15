const initialState = {
  user: {
    id: null,
    name: null,
    email: null,
    password: null,
    pendingList: [],
    contactList: [],
    token: null,
    phone:null
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
          phone: action.payload.phone
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
      const contactIndex = state.user.contactList.findIndex(
        contact => contact._id === id
      );
    
      if (contactIndex !== -1) {
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [
              ...state.user.contactList.slice(0, contactIndex),
              { ...state.user.contactList[contactIndex], phone },
              ...state.user.contactList.slice(contactIndex + 1),
            ],
          },
        };
      }
      const pendingIndex = state.user.pendingList.findIndex(contact => contact._id === id);
      if (pendingIndex !== -1) {
        return {
          ...state,
          user: {
            ...state.user,
            pendingList: [
              ...state.user.pendingList.slice(0, pendingIndex),
              { ...state.user.pendingList[pendingIndex], phone },
              ...state.user.pendingList.slice(pendingIndex + 1),
            ],
          },
        };
      }
      return state;
    }

    case 'MODIFY_USER_EMAIL' : {
      const { id, email} = action.payload;
      const userIndex = state.user.contactList.findIndex(
        contact => contact._id === id
      );
      if (userIndex === -1){
        const userPIndex = state.user.pendingList.findIndex(
          contact => contact._id === id
        );
        if (userPIndex === -1) return state;
        else
          return {
            ...state,
            user: {
              ...state.user,
              pendingList: [
                ...state.user.pendingList.slice(0, userPIndex),
                { ...state.user.pendingList[userPIndex], email},
                ...state.user.pendingList.slice(userPIndex + 1),
              ],
            },
          }
      }
      else
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [
              ...state.user.contactList.slice(0, userIndex),
              { ...state.user.contactList[userIndex], email},
              ...state.user.contactList.slice(userIndex + 1),
            ],
          },
        };
    }

    case 'MODIFY_USER_NAME' : {
      const {id,name} = action.payload;
      const userIndex = state.user.contactList.findIndex(
        contact => contact._id === id
      );
      console.log(userIndex,state.user.contactList[userIndex]);
      if (userIndex === -1){
        const userPIndex = state.user.pendingList.findIndex(
          contact => contact._id === id
        );
        if (userPIndex === -1) return state;
        else
          return {
            ...state,
            user: {
              ...state.user,
              pendingList: [
                ...state.user.pendingList.slice(0, userPIndex),
                { ...state.user.pendingList[userPIndex],name},
                ...state.user.pendingList.slice(userPIndex + 1),
              ],
            },
          }
      }
      else
        return {
          ...state,
          user: {
            ...state.user,
            contactList: [
              ...state.user.contactList.slice(0, userIndex),
              { ...state.user.contactList[userIndex],name},
              ...state.user.contactList.slice(userIndex + 1),
            ],
          },
        };
    }

    case 'CHANGE_NAME':
      const {newName} = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          name:newName
        }
      }

    case 'CHANGE_PHONE':
      const {newPhone} = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          name:newPhone
        }
      }
    
    case 'CHANGE_EMAIL':
      const {newEmail} = action.payload;
      return {
        ...state,
        user:{
          ...state.email,
          email:newEmail
        }
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
