// lib/api.js - Código Corregido

import AsyncStorage from '@react-native-async-storage/async-storage';

export const backendConfig = {
  baseUrl: "http://192.168.3.110:3002/api", // Asegúrate de que esta URL sea la correcta para tu backend
};

// --- Funciones de Autenticación ---

/**
 * Registra un nuevo usuario en el backend.
 * @param {Object} userData - Objeto con los datos del usuario.
 * @param {string} userData.controlNumber - Número de control del usuario.
 * @param {string} userData.fullName - Nombre completo del usuario.
 * @param {string} userData.career - Carrera del usuario.
 * @param {number} userData.age - Edad del usuario.
 * @param {number} userData.semester - Semestre del usuario.
 * @param {string} userData.password - Contraseña del usuario.
 * @returns {Promise<Object>} - Datos del usuario logueado tras el registro.
 * @throws {Error} - Si hay un error en el registro.
 */
export async function createUser({ controlNumber, fullName, career, age, semester, password }) {
  try {
    const response = await fetch(`${backendConfig.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        controlNumber,
        fullName,
        career,
        age,
        semester,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }

    // Si el registro es exitoso, iniciamos sesión automáticamente
    return await signIn(controlNumber, password);
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error;
  }
}

/**
 * Inicia sesión de un usuario en el backend.
 * @param {string} controlNumber - Número de control del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} - Datos del usuario logueado.
 * @throws {Error} - Si hay un error en el inicio de sesión.
 */
export async function signIn(controlNumber, password) {
  try {
    const response = await fetch(`${backendConfig.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ controlNumber, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    // Guarda el token JWT en AsyncStorage
    await AsyncStorage.setItem('userToken', data.token);

    // Obtener los detalles completos del usuario logueado
    return await getCurrentUser();
  } catch (error) {
    console.error("Error en signIn:", error);
    // Eliminar token si hay un error de inicio de sesión
    await AsyncStorage.removeItem('userToken');
    throw error;
  }
}

/**
 * Obtiene los datos del usuario actualmente autenticado usando el token.
 * @returns {Promise<Object|null>} - Objeto con los datos del usuario o null si no hay token/error.
 * @throws {Error} - Si hay un error inesperado al obtener el usuario.
 */
export async function getCurrentUser() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return null;
    }

    const response = await fetch(`${backendConfig.baseUrl}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.removeItem('userToken'); // Token inválido o expirado
      }
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: No se pudo obtener el usuario actual.` }));
      throw new Error(errorData.message || `Error ${response.status}: No se pudo obtener el usuario actual.`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    await AsyncStorage.removeItem('userToken');
    return null;
  }
}

/**
 * Cierra la sesión del usuario eliminando el token.
 */
export async function signOut() {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error("Error en signOut:", error);
    throw error;
  }
}

// --- Funciones de Búsqueda de Usuarios ---

/**
 * Busca un usuario por su número de control.
 * No requiere token si el backend no lo exige para esta ruta.
 * @param {string} controlNumber - Número de control a buscar.
 * @returns {Promise<{user: Object|null, message: string}>} - Objeto con el usuario encontrado y un mensaje.
 * @throws {Error} - Si hay un error en la búsqueda.
 */
export async function findUserByControlNumber(controlNumber) {
  try {
    // Si tu backend no requiere token para esta ruta, no es necesario obtenerlo ni validarlo aquí.
    // const token = await AsyncStorage.getItem('userToken');
    // if (!token) throw new Error('No se encontró token de autenticación.'); // Ya no falla si no hay token

    const response = await fetch(`${backendConfig.baseUrl}/auth/check-control-number/${encodeURIComponent(controlNumber)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': token ? `Bearer ${token}` : undefined, // Puedes quitarlo si la ruta es pública
      },
    });

    const data = await response.json();
    console.log("findUserByControlNumber data (direct from backend):", data); // Log original

    if (!response.ok) {
      // Si el backend envía un status de error (4xx, 5xx)
      throw new Error(data.message || `Error ${response.status} al buscar usuario por número de control`);
    }

    // Si data.user existe y tiene un id, significa que el usuario fue encontrado.
    // userResponse.user.id es 3 (number), lo cual es "truthy", así que `typeof data.user.id === 'number'` es lo que realmente importa aquí
    if (data.user && typeof data.user.id === 'number') {
        return { user: data.user, message: data.message };
    } else {
        // Esto se ejecutará si data.user es null/undefined o si data.user.id no es un número.
        return { user: null, message: data.message || 'No se encontró el usuario con ese número de control en la respuesta del backend.' };
    }

  } catch (error) {
    console.error("Error en findUserByControlNumber:", error.message);
    // Relanza el error para que sea capturado por la función llamante (registerDropout)
    throw new Error(error.message || "Error al buscar usuario por número de control.");
  }
}

// --- Funciones para Gestión de Bajas ---

/**
 * Registra una baja de usuario.
 * @param {Object} dropoutData - Objeto con los datos de la baja.
 * @param {string} dropoutData.controlNumber - Número de control del alumno.
 * @param {string} dropoutData.dropoutType - Tipo de baja.
 * @param {string} dropoutData.dropoutPeriod - Periodo de la baja.
 * @param {string} dropoutData.absencePeriod - Periodo de ausencia.
 * @param {string} dropoutData.dropoutDate - Fecha de la baja (formato 'YYYY-MM-DD').
 * @param {string} dropoutData.reason - Razón de la baja.
 * @returns {Promise<Object>} - Respuesta del backend tras el registro.
 * @throws {Error} - Si hay un error en el registro.
 */
export async function registerDropout(dropoutData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación para registrar baja.');

    // Paso 1: Obtener el userId del alumno usando su controlNumber
    console.log("registerDropout: Llamando a findUserByControlNumber con:", dropoutData.controlNumber);
    const userResponse = await findUserByControlNumber(dropoutData.controlNumber);
    console.log("registerDropout: Resultado de findUserByControlNumber:", userResponse); // Nuevo log crucial

    // ¡Aquí está la pequeña trampa! La condición revisada:
    // Aseguramos que userResponse exista, que userResponse.user exista, y que userResponse.user.id sea un número > 0.
    // Basado en el log que me diste, esta condición DEBERÍA ser falsa (no entrar en el if).
    // Si aún así entra, el problema es mucho más profundo (ejecución fantasma, variable sobrescrita, etc., lo cual es muy raro).
    if (!userResponse || !userResponse.user || typeof userResponse.user.id !== 'number' || userResponse.user.id <= 0) {
      console.error("registerDropout: Fallo en la validación de userResponse. Causa:", {
          userResponseExists: !!userResponse,
          userExists: !!userResponse?.user,
          userIdType: typeof userResponse?.user?.id,
          userIdValue: userResponse?.user?.id
      });
      throw new Error("No se pudo encontrar al alumno con el número de control proporcionado.");
    }

    const userId = userResponse.user.id;
    console.log("registerDropout: user ID encontrado:", userId);


    // Paso 2: Enviar la petición de registro de baja con el userId
    const response = await fetch(`${backendConfig.baseUrl}/admin/dropouts/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Esto requiere un token de admin
      },
      body: JSON.stringify({
        user_id: userId, // Backend espera user_id
        dropout_type: dropoutData.dropoutType,
        dropout_period: dropoutData.dropoutPeriod,
        absence_period: dropoutData.absencePeriod,
        dropout_date: dropoutData.dropoutDate,
        reason: dropoutData.reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar la baja');
    }
    return data;
  } catch (error) {
    console.error("Error en registerDropout (catch final):", error.message); // Log más claro
    throw error; // Re-lanza el error para que lo capture el componente de UI
  }
}

/**
 * Obtiene todas las bajas registradas.
 * @returns {Promise<Object>} - Objeto con un array de bajas.
 * @throws {Error} - Si hay un error al obtener las bajas.
 */
export async function getAllDropouts() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/admin/dropouts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener todas las bajas');
    }
    return data; // Debería devolver un objeto con `dropouts: [...]`
  } catch (error) {
    console.error("Error en getAllDropouts:", error);
    throw error;
  }
}

/**
 * Busca bajas por el número de control de un usuario.
 * @param {string} controlNumber - Número de control del usuario para buscar sus bajas.
 * @returns {Promise<Object>} - Objeto con un array de bajas.
 * @throws {Error} - Si hay un error en la búsqueda.
 */
export async function searchDropoutsByControlNumber(controlNumber) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/admin/dropouts/${encodeURIComponent(controlNumber)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar bajas por número de control');
    }
    return data; // Debería devolver un objeto con `dropouts: [...]`
  } catch (error) {
    console.error("Error en searchDropoutsByControlNumber:", error);
    throw error;
  }
}

// --- Funciones de Manejo de Archivos y Posts de Video (si son necesarias) ---

/**
 * Sube un archivo al servidor.
 * @param {Object} file - Objeto de archivo (uri, name, type).
 * @param {string} type - Tipo de archivo (e.g., "image", "video").
 * @returns {Promise<string>} - URL del archivo subido.
 * @throws {Error} - Si el archivo es inválido o hay un error al subir.
 */
export async function uploadFile(file, type) {
  if (!file || !file.uri) throw new Error("Archivo inválido para subir.");

  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || `upload_${Date.now()}.${file.uri.split('.').pop()}`,
      type: file.type || 'application/octet-stream',
    });

    const response = await fetch(`${backendConfig.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al subir archivo');
    }
    return data.fileUrl;
  } catch (error) {
    console.error("Error en uploadFile:", error);
    throw error;
  }
}

/**
 * (Placeholder) Obtiene la URL de vista previa de un archivo.
 * Ajusta esta función según la lógica de tu backend para obtener URLs de archivos.
 * @param {string} fileId - ID o nombre del archivo.
 * @param {string} type - Tipo de archivo.
 * @returns {string} - URL de vista previa.
 */
export async function getFilePreview(fileId, type) {
  // Esta función es un placeholder. Ajusta según cómo tu backend maneje las vistas previas de archivos.
  // Podría ser simplemente devolver la URL completa si `uploadFile` ya la proporciona.
  return fileId;
}

/**
 * Elimina un usuario por su ID (requiere rol de administrador).
 * @param {number} userId - El ID del usuario a eliminar.
 * @returns {Promise<Object>} - Mensaje de confirmación de la eliminación.
 * @throws {Error} - Si no hay token, no es admin, o hay un error en el backend.
 */
export async function deleteUserById(userId) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión como administrador.');
    }

    // La ruta esperará un token de un usuario con rol de administrador
    const response = await fetch(`${backendConfig.baseUrl}/admin/users/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el backend devuelve un 401, 403 o cualquier otro error
      throw new Error(data.message || `Error ${response.status}: No se pudo eliminar el usuario.`);
    }

    return data; // Debería contener el mensaje de éxito del backend
  } catch (error) {
    console.error("Error en deleteUserById:", error);
    throw error; // Re-lanza el error para que el componente de UI lo maneje
  }
}

