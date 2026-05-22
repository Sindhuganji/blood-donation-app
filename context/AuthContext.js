import React, {
  createContext,
  useContext,
  useState,
} from 'react';

// import AsyncStorage from "@react-native-async-storage/async-storage"; // if used

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // If you store token/user in AsyncStorage, clear here:
      // await AsyncStorage.removeItem("token");
      // await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}