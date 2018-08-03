import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const initialState = {};

const middleware = [thunk];

function BrowserDetection() {
  // Only chrome can handle the redux dev tools,
  //Redux compose cannot handle a null or undefined middleware
  if (navigator.userAgent.search("Chrome")) {
    var store = createStore(
      rootReducer,
      initialState,
      compose(
        applyMiddleware(...middleware),
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    );
  } else {
    var store = createStore(
      rootReducer,
      initialState,
      compose(applyMiddleware(...middleware))
    );
  }
}

export default store;
