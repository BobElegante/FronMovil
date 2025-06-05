// src/context/GlobalProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/api'; // Asegúrate de que esta ruta sea correcta

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  // const [error, setError] = useState(null); // No es estrictamente necesario exponer el error globalmente a menos que un caso de uso específico lo requiera

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        // setError(null); // Limpiamos cualquier error anterior

        const currentUser = await getCurrentUser();

        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error en GlobalProvider al obtener usuario:", error);
        // setError(error); // Guardamos el error si es necesario
        setIsLogged(false);
        setUser(null);
        // getCurrentUser en api.js ya maneja la limpieza del token en caso de error.
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        isLoading,
        // error, // Removido si no se usa
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;