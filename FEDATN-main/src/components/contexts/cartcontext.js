import { createContext, useReducer } from "react";

export const Cartcontext = createContext();

export const actions = {
  ADD: "ADD",
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
  REMOVE: "REMOVE",
};

export const Context = (props) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case actions.ADD:
        const existingItem = state.find((item) => action.payload._id === item._id);
        console.log(state, action , "stateDP"); 
        
        if (existingItem) {
          return state.map((item) => 
          item._id === action.payload._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
          );
        } else {
          return [...state, { ...action.payload, quantity: 1 }]; 
        }

        case actions.INCREASE:
          
          return state.map((item) =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item 
          );

          case actions.DECREASE:
            return state.map((item) =>
              item._id === action.payload._id
                ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
                : item
            );
    

      case actions.REMOVE:
        return state.filter((item) => item._id !== action.payload._id);

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, []);
  const info = { state, dispatch };

  return (
    <Cartcontext.Provider value={info}>
      {props.children}
    </Cartcontext.Provider>
  );
};
