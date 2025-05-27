import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/api'; // Asegúrate de que esta ruta sea correcta

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  const [error, setError] = useState(null); // Nuevo estado para manejar errores

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true); // Comenzamos a cargar
        setError(null); // Limpiamos cualquier error anterior

        const currentUser = await getCurrentUser(); // Intenta obtener el usuario actual

        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error en GlobalProvider al obtener usuario:", error);
        setError(error); // Guardamos el error
        setIsLogged(false);
        setUser(null);
        // Si hay un error al obtener el usuario, es crucial limpiar el token si está corrupto
        // (getCurrentUser en api.js ya hace esto)
      } finally {
        setIsLoading(false); // Terminamos de cargar, independientemente del resultado
      }
    };

    checkUser();
  }, []); // El efecto se ejecuta solo una vez al montar el componente

  // Proporcionamos el estado y las funciones a los componentes hijos
  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        isLoading,
        error, // También podemos exponer el error si es necesario
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider; 