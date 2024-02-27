// MyContext.js
import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [myValue, setMyValue] = useState(null);

  const updateMyValue = (newValue) => {
    setMyValue(newValue);
  };

  return (
    <MyContext.Provider value={{ myValue, updateMyValue }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};
