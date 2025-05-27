import AsyncStorage from '@react-native-async-storage/async-storage';

export const backendConfig = {
  baseUrl: "http://192.168.1.197:3000/api", // Asegúrate de que esta URL sea la correcta para tu backend
};

// --- Funciones de Autenticación ---

/**
 * Registra un nuevo usuario en el backend.
 * @param {string} controlNumber - Número de control del usuario.
 * @param {string} fullName - Nombre completo del usuario.
 * @param {string} career - Carrera del usuario.
 * @param {number} age - Edad del usuario.
 * @param {number} semester - Semestre del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} - Datos del usuario logueado tras el registro.
 * @throws {Error} - Si hay un error en el registro.
 */
export async function createUser(controlNumber, fullName, career, age, semester, password) {
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

    // Si la respuesta no es OK, podría ser un 401 (no autorizado) o 403 (prohibido)
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.removeItem('userToken'); // Token inválido o expirado
      }
      // Intentar parsear el error del backend si es JSON
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: No se pudo obtener el usuario actual.` }));
      throw new Error(errorData.message || `Error ${response.status}: No se pudo obtener el usuario actual.`);
    }

    // Si la respuesta es OK, devolver el objeto JSON del usuario
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    // Para cualquier otro error (incluyendo errores de parseo JSON si la respuesta no es JSON),
    // limpiar el token y devolver null, ya que el estado del usuario es incierto.
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
 * Busca un usuario por su número de control (solo para administradores).
 * @param {string} controlNumber - Número de control a buscar.
 * @returns {Promise<{user: Object|null, message: string}>} - Objeto con el usuario encontrado y un mensaje.
 * @throws {Error} - Si hay un error en la búsqueda o falta el token.
 */
export async function findUserByControlNumber(controlNumber) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/auth/check-control-number/${encodeURIComponent(controlNumber)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // El backend podría devolver 200 incluso si no encuentra el usuario,
    // o 404. Si es 200 y no hay `user` en los datos, asumimos que no se encontró.
    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar usuario por número de control');
    }

    if (data.user) {
        return { user: data.user, message: data.message };
    } else {
        // Backend indica que el número de control está disponible (no encontrado)
        return { user: null, message: data.message || 'No se encontró el usuario.' };
    }

  } catch (error) {
    console.error("Error en findUserByControlNumber:", error);
    throw error;
  }
}

// --- Funciones para Gestión de Bajas ---

/**
 * Registra una baja de usuario.
 * @param {Object} dropoutData - Objeto con los datos de la baja.
 * @param {string} dropoutData.userId - Número de control del alumno (backend lo usará para buscar el ID).
 * @param {string} dropoutData.dropoutType - Tipo de baja.
 * @param {string} dropoutData.dropoutPeriod - Periodo de la baja.
 * @param {string} dropoutData.absencePeriod - Periodo de ausencia.
 * @param {Date} dropoutData.dropoutDate - Fecha de la baja (objeto Date).
 * @param {string} dropoutData.reason - Razón de la baja.
 * @returns {Promise<Object>} - Respuesta del backend tras el registro.
 * @throws {Error} - Si hay un error en el registro.
 */
export async function registerDropout(dropoutData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/admin/dropouts/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        control_number: dropoutData.userId, // El backend espera control_number para buscar el alumno
        dropout_type: dropoutData.dropoutType,
        dropout_period: dropoutData.dropoutPeriod,
        absence_period: dropoutData.absencePeriod,
        dropout_date: dropoutData.dropoutDate.toISOString().split('T')[0], // Formatear a 'YYYY-MM-DD'
        reason: dropoutData.reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar la baja');
    }
    return data;
  } catch (error) {
    console.error("Error en registerDropout:", error);
    throw error;
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
 * Crea una nueva publicación de video.
 * @param {Object} form - Objeto con los datos del formulario (title, thumbnail, video, prompt).
 * @returns {Promise<Object>} - Datos de la publicación creada.
 * @throws {Error} - Si hay un error al crear la publicación.
 */
export async function createVideoPost(form) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    // Sube la miniatura y el video en paralelo
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const response = await fetch(`${backendConfig.baseUrl}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear el post de video');
    }
    return data;
  } catch (error) {
    console.error("Error en createVideoPost:", error);
    throw error;
  }
}

/**
 * Obtiene todas las publicaciones de video.
 * @returns {Promise<Object>} - Objeto con un array de publicaciones.
 * @throws {Error} - Si hay un error al obtener las publicaciones.
 */
export async function getAllPosts() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/videos`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener todos los posts');
    }
    return data;
  } catch (error) {
    console.error("Error en getAllPosts:", error);
    throw error;
  }
}

/**
 * Obtiene las publicaciones de video de un usuario específico.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<Object>} - Objeto con un array de publicaciones del usuario.
 * @throws {Error} - Si hay un error al obtener las publicaciones del usuario.
 */
export async function getUserPosts(userId) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/videos/user/${userId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener posts del usuario');
    }
    return data;
  } catch (error) {
    console.error("Error en getUserPosts:", error);
    throw error;
  }
}

/**
 * Busca publicaciones de video por una consulta.
 * @param {string} query - Término de búsqueda.
 * @returns {Promise<Object>} - Objeto con un array de publicaciones que coinciden.
 * @throws {Error} - Si hay un error en la búsqueda.
 */
export async function searchPosts(query) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/videos/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar posts de video');
    }
    return data;
  } catch (error) {
    console.error("Error en searchPosts:", error);
    throw error;
  }
}

/**
 * Obtiene las publicaciones de video más recientes.
 * @returns {Promise<Object>} - Objeto con un array de las publicaciones más recientes.
 * @throws {Error} - Si hay un error al obtener las últimas publicaciones.
 */
export async function getLatestPosts() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const response = await fetch(`${backendConfig.baseUrl}/videos/latest`, { // Asumiendo una ruta /videos/latest en tu backend
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener los últimos posts');
    }
    return data;
  } catch (error) {
    console.error("Error en getLatestPosts:", error);
    throw error;
  }
}