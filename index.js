import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import userReducer from './reduxStore/userReducer';
import { configureStore } from '@reduxjs/toolkit';

import App from './App';

const store = configureStore({
  reducer: {
    user:userReducer
  },
});

const ReduxApp = () => (
    <Provider store={store}>
      <App />
    </Provider>
  );

registerRootComponent(ReduxApp);
