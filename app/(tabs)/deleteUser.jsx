// // src/app/(tabs)/admin/users.jsx

// import React, { useState, useEffect } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   View,
//   Text,
//   FlatList,
//   Button,
//   Alert,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import { router } from 'expo-router'; // Para posibles navegaciones
// import { useGlobalContext } from '../../../context/GlobalProvider';
// import { deleteUserById, findUserByControlNumber } from '../../../lib/api'; // Asegúrate de importar deleteUserById
// import { icons } from '../../../constants'; // Asumo que tienes iconos para la UI
// import CustomButton from '../../../components/CustomButton'; // Si tienes un CustomButton

// // NOTA: Necesitarás una función en tu lib/api.js para obtener *todos* los usuarios.
// // Aquí asumiremos que tienes `getAllUsers` o una forma de listar usuarios.
// // Si no la tienes, te doy una sugerencia al final.
// import { getAllUsers } from '../../../lib/api'; // ¡IMPORTANTE: Asegúrate de implementar esta función en lib/api.js!

// const AdminUsersScreen = () => {
//   const { user, isLoading: authLoading } = useGlobalContext();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   // Asegura que solo los administradores puedan ver esta pantalla
//   if (!authLoading && (!user || user.role !== 'admin')) {
//     return (
//       <SafeAreaView className="bg-primary h-full flex justify-center items-center">
//         <View className="flex-1 justify-center items-center px-4">
//           <Text className="text-white text-lg text-center">
//             Acceso denegado. Solo administradores pueden ver esta sección.
//           </Text>
//           <CustomButton
//             title="Ir a Inicio"
//             handlePress={() => router.replace('/home')}
//             containerStyles="mt-4 bg-secondary w-full"
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const fetchUsers = async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       // Necesitas implementar getAllUsers en lib/api.js y una ruta en tu backend.
//       const response = await getAllUsers();
//       if (response && Array.isArray(response.users)) {
//         setUsers(response.users);
//       } else {
//         // Manejar caso donde el backend no devuelve un array en 'users'
//         console.warn("getAllUsers no devolvió un array de usuarios:", response);
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error("Error al cargar usuarios:", err);
//       setError(err.message || "Error al cargar usuarios.");
//     } finally {
//       setRefreshing(false);
//       setLoading(false); // Desactivar el loading inicial una vez cargados los datos
//     }
//   };

//   useEffect(() => {
//     // Carga inicial de usuarios
//     if (user?.role === 'admin') { // Solo intenta cargar si es admin
//       fetchUsers();
//     }
//   }, [user]); // Dependencia del user para que se cargue cuando el contexto esté listo

//   const onRefresh = async () => {
//     await fetchUsers();
//   };

//   const handleDeleteUser = async (userId, userName) => {
//     Alert.alert(
//       "Confirmar Eliminación",
//       `¿Estás seguro de que quieres eliminar a ${userName} (ID: ${userId})? Esta acción es irreversible.`,
//       [
//         { text: "Cancelar", style: "cancel" },
//         {
//           text: "Eliminar",
//           onPress: async () => {
//             try {
//               if (user && user.id === userId) {
//                 Alert.alert("Error", "No puedes eliminar tu propia cuenta.");
//                 return;
//               }
//               setLoading(true); // Activar loading mientras se elimina
//               const result = await deleteUserById(userId);
//               Alert.alert("Éxito", result.message);
//               fetchUsers(); // Recargar la lista de usuarios después de la eliminación
//             } catch (err) {
//               console.error("Error al eliminar usuario:", err);
//               Alert.alert("Error", err.message || "No se pudo eliminar el usuario.");
//             } finally {
//               setLoading(false); // Desactivar loading
//             }
//           },
//           style: "destructive",
//         },
//       ]
//     );
//   };

//   if (loading || authLoading) { // Mostrar spinner si está cargando la autenticación o los usuarios
//     return (
//       <SafeAreaView className="bg-primary h-full flex justify-center items-center">
//         <ActivityIndicator size="large" color="#FFA001" />
//         <Text className="text-white text-lg mt-4">Cargando usuarios...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView className="bg-primary h-full flex justify-center items-center">
//         <Text className="text-red-500 text-lg text-center">Error: {error}</Text>
//         <CustomButton title="Reintentar" handlePress={fetchUsers} containerStyles="mt-4 w-1/2" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <ScrollView
//         className="px-4 my-6"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
//         }
//       >
//         <View className="flex-row justify-between items-center mb-6">
//           <Text className="text-white text-2xl font-psemibold">Gestión de Usuarios</Text>
//           <TouchableOpacity
//             onPress={fetchUsers} // Botón para recargar (opcional, ya hay pull-to-refresh)
//             className="p-2 rounded-full bg-secondary-100"
//           >
//             <Image
//               source={icons.reload} // Asume que tienes un ícono de recarga
//               className="w-6 h-6"
//               resizeMode="contain"
//               tintColor="#FF9001"
//             />
//           </TouchableOpacity>
//         </View>

//         {users.length === 0 ? (
//           <View className="flex-1 justify-center items-center mt-20">
//             <Image
//               source={icons.empty} // Asume que tienes un ícono para lista vacía
//               className="w-24 h-24"
//               resizeMode="contain"
//               tintColor="#FFFFFF"
//             />
//             <Text className="text-white text-xl font-psemibold mt-4">No hay usuarios registrados.</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={users}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <View className="bg-black-100 p-4 mb-3 rounded-lg flex-row justify-between items-center border border-gray-700">
//                 <View>
//                   <Text className="text-white font-psemibold text-lg">{item.full_name || item.fullName}</Text>
//                   <Text className="text-gray-100 text-sm">Control: {item.control_number || item.controlNumber}</Text>
//                   <Text className="text-gray-100 text-sm">Rol: {item.role}</Text>
//                 </View>
//                 <CustomButton
//                   title="Eliminar"
//                   handlePress={() => handleDeleteUser(item.id, item.full_name || item.fullName)}
//                   containerStyles="bg-red-600 px-4 py-2 rounded-md"
//                   textStyles="text-white text-sm"
//                 />
//               </View>
//             )}
//             scrollEnabled={false} // Para que el ScrollView padre maneje el scroll
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Configuración del encabezado para Expo Router
// AdminUsersScreen.options = {
//   headerShown: false, // Oculta el encabezado predeterminado de la pila
//   title: 'Usuarios Admin', // Título que se mostrará en la pestaña si la tuvieras configurada
// };

// export default AdminUsersScreen;