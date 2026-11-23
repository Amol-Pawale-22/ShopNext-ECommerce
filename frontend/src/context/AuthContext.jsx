import React from "react";
import { createContext } from "react";
import { useState } from "react";

 export const AuthContext = createContext();

 export const AuthProvider = function ({ children}){

const [ user , setUSer ] = useState(
  localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
);

const login = function (userData){
  
    setUSer(userData);
  localStorage.setItem("userInfo", JSON.stringify(userData));

};

const logout = function(){
    setUSer(null);
    localStorage.removeItem("userInfo");
};
 

return (
<AuthContext.Provider value={{ user, login , logout}}>
    {children}
</AuthContext.Provider>

);
    
};