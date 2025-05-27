import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, Text, View, Dimensions, Alert } from "react-native"; // Agregamos Dimensions y Alert
import { Link, router } from "expo-router"; // Importamos Link y router

import { images } from "../../constants";
import { getAllPosts, getLatestPosts, getCurrentUser, signOut } from "../../lib/api"; // <-- Importa desde tu API local
import { EmptyState, SearchInput, Trending, VideoCard, CustomButton } from "../../components"; // Asegúrate de tener CustomButton
import { useGlobalContext } from "../../context/GlobalProvider"; // Para acceder al usuario global

// --- Home para Estudiante ---
const StudentHome = ({ posts, latestPosts, refreshing, onRefresh, user }) => {
// Asegúrate de que `user` contenga `fullName` para el saludo
const userName = user?.fullName || "Estudiante";

// Función para manejar la navegación al expediente (simulado por ahora)
const handleExpedienteClick = () => {
// Aquí puedes navegar a tu ruta de expediente si la tienes definida
// Por ejemplo: router.push('/expediente');
Alert.alert("Funcionalidad Pendiente", "Navegar a la pantalla de expediente.");
};

const handleEvaluacionClick = () => {
Alert.alert("Funcionalidad Pendiente", "Navegar a la pantalla de evaluación.");
};

return (
<SafeAreaView className="bg-primary h-full">
<FlatList
data={posts} // Esto puede ser vacío si el estudiante no ve videos de posts
keyExtractor={(item) => item.id} // Cambiado de $id a id para tu backend
renderItem={({ item }) => (
// Esto es opcional, si los estudiantes también ven videos
<VideoCard
title={item.title}
thumbnail={item.thumbnail}
video={item.video}
// creator={item.creator?.username} // Asegúrate que tu backend adjunte el creador si lo quieres aquí
// avatar={item.creator?.avatar}
/>
)}
ListHeaderComponent={() => (
<View className="flex my-6 px-4 space-y-6">
{/* Saludo al Estudiante */}
<View className="flex justify-between items-start flex-row mb-6">
<View>
<Text className="font-pmedium text-sm text-gray-100">
¡Bienvenido de vuelta!
</Text>
<Text className="text-2xl font-psemibold text-white">
{userName}
</Text>
</View>
<View className="mt-1.5">
<Image
source={images.logotec} // Usar tu logo principal
className="w-12 h-12" // Ajusta el tamaño si es necesario
resizeMode="contain"
/>
</View>
</View>

{/* Buscador (opcional para estudiante, si busca algo) */}
<SearchInput />

{/* Contenido principal del Home del estudiante - adaptando tu diseño anterior */}
<View className="w-full flex-1 pt-5 pb-8 flex-col md:flex-row items-center justify-center">
{/* Contenedor para la imagen a la izquierda */}
<View className="w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0">
<Image
source={images.libreImage} // Asegúrate de importar tu imagen libre.jpg en constants/images.js
resizeMode="contain"
className="w-full h-64 rounded-lg" // Ajusta tamaño y bordes
/>
</View>

{/* Contenedor para el contenido a la derecha */}
<View className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center p-4">
<Text className="text-2xl font-psemibold text-white mb-4 text-center md:text-left">
Bienvenido a CoyoteApp
</Text>
<Text className="text-lg font-pregular text-gray-200 mb-6 text-center md:text-left">
Aquí podrás gestionar tus actividades y consultar tu expediente.
</Text>

{/* Botones emergentes */}
<View className="flex flex-row flex-wrap justify-center md:justify-start gap-4">
<CustomButton
title="Realizar evaluación"
handlePress={handleEvaluacionClick}
containerStyles="w-48 my-2" // Ajusta el ancho de los botones
textStyles="text-md"
/>
<CustomButton
title="Expediente"
handlePress={handleExpedienteClick}
containerStyles="w-48 my-2"
textStyles="text-md"
/>
</View>
</View>
</View>

{/* Seccion de videos mas recientes (opcional si el estudiante tiene este feed) */}
<View className="w-full flex-1 pt-5 pb-8">
<Text className="text-lg font-pregular text-gray-100 mb-3">
Videos Recientes (Opcional)
</Text>
<Trending posts={latestPosts ?? []} />
</View>
</View>
)}
ListEmptyComponent={() => (
<EmptyState
title="Contenido no disponible"
subtitle="Por el momento no hay videos para mostrar."
/>
)}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
}
/>
</SafeAreaView>
);
};

// --- Home para Administrador ---
const AdminHome = ({ posts, latestPosts, refreshing, onRefresh, user }) => {
const userName = user?.fullName || "Administrador";

// Función para manejar el logout (compartida)
const handleLogout = async () => {
try {
await signOut();
setUser(null);
setIsLogged(false);
Alert.alert("Sesión cerrada", "Has cerrado sesión exitosamente.");
router.replace('/sign-in'); // Redirigir a la pantalla de inicio de sesión
} catch (error) {
console.error("Error al cerrar sesión:", error);
Alert.alert("Error", "No se pudo cerrar la sesión.");
}
};

return (
<SafeAreaView className="bg-primary h-full">
<FlatList
data={posts}
keyExtractor={(item) => item.id} // Cambiado de $id a id para tu backend
renderItem={({ item }) => (
<VideoCard
title={item.title}
thumbnail={item.thumbnail}
video={item.video}
// creator={item.creator?.username}
// avatar={item.creator?.avatar}
/>
)}
ListHeaderComponent={() => (
<View className="flex my-6 px-4 space-y-6">
{/* Saludo al Administrador */}
<View className="flex justify-between items-start flex-row mb-6">
<View>
<Text className="font-pmedium text-sm text-gray-100">
¡Bienvenido, Administrador!
</Text>
<Text className="text-2xl font-psemibold text-white">
{userName}
</Text>
</View>
<View className="mt-1.5">
<Image
source={images.logoSmall}
className="w-9 h-10"
resizeMode="contain"
/>
</View>
</View>

<SearchInput />

<View className="w-full flex-1 pt-5 pb-8">
<Text className="text-lg font-pregular text-gray-100 mb-3">
Últimos Videos
</Text>
<Trending posts={latestPosts ?? []} />
</View>

{/* Botón de ejemplo para Admin */}
<CustomButton
title="Gestionar Usuarios"
handlePress={() => Alert.alert("Funcionalidad Pendiente", "Navegar a gestión de usuarios.")}
containerStyles="mt-4 bg-secondary-100"
/>
<CustomButton
title="Cerrar Sesión"
handlePress={handleLogout}
containerStyles="mt-4 bg-red-500" // Botón de logout
/>
</View>
)}
ListEmptyComponent={() => (
<EmptyState
title="No Videos Found"
subtitle="No hay videos para gestionar"
/>
)}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
}
/>
</SafeAreaView>
);
};

// --- Componente Home Principal (Selector de Rol) ---
const Home = () => {
const { user, isLoading, setIsLogged, setUser } = useGlobalContext(); // Obtenemos el usuario del contexto

// Use state hooks for data fetching, no longer useAppwrite hook
const [posts, setPosts] = useState([]);
const [latestPosts, setLatestPosts] = useState([]);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null); // Para manejar errores de carga

// Función para cargar los datos
const fetchData = async () => {
setRefreshing(true);
setError(null); // Limpiar errores anteriores
try {
const allPostsData = await getAllPosts();
const latestPostsData = await getLatestPosts();
setPosts(allPostsData);
setLatestPosts(latestPostsData);
} catch (err) {
console.error("Error fetching data for Home:", err);
setError(err.message || "Error al cargar los datos.");
Alert.alert("Error de Carga", err.message || "No se pudieron obtener los datos.");
} finally {
setRefreshing(false);
}
};

useEffect(() => {
fetchData(); // Cargar datos cuando el componente se monta
}, []);

const onRefresh = async () => {
await fetchData(); // Recargar datos al refrescar
};

if (isLoading) {
return (
<SafeAreaView className="bg-primary h-full flex justify-center items-center">
<Text className="text-white text-lg">Cargando perfil...</Text>
</SafeAreaView>
);
}

// Renderizado condicional basado en el rol del usuario
if (user?.role === 'admin') { // Asumiendo que tu backend envía 'admin' como rol
return (
<AdminHome
posts={posts}
latestPosts={latestPosts}
refreshing={refreshing}
onRefresh={onRefresh}
user={user}
setIsLogged={setIsLogged} // Pasa setIsLogged para el logout del admin
setUser={setUser} // Pasa setUser para el logout del admin
/>
);
} else if (user?.role === 'student') { // Asumiendo que tu backend envía 'student' como rol
return (
<StudentHome
posts={posts} // Puedes decidir si los estudiantes ven todos los posts de video
latestPosts={latestPosts} // O si solo ven sus posts relacionados o algo diferente
refreshing={refreshing}
onRefresh={onRefresh}
user={user}
/>
);
} else {
// Si no hay usuario, o el rol no está definido, o no es ninguno de los esperados
// Puedes redirigir a login o mostrar un mensaje de error
console.log("Rol de usuario no reconocido o no autenticado:", user?.role);
// router.replace('/sign-in'); // Esto podría causar un bucle si getCurrentUser falla
return (
<SafeAreaView className="bg-primary h-full flex justify-center items-center">
<Text className="text-white text-lg">Error: Rol de usuario no válido o no autenticado.</Text>
<CustomButton
title="Regresar al inicio de sesión"
handlePress={() => {
signOut(); // Intenta cerrar sesión para limpiar el token
setIsLogged(false);
setUser(null);
router.replace('/sign-in');
}}
containerStyles="mt-4 bg-red-500"
/>
</SafeAreaView>
);
}
};

export default Home;
