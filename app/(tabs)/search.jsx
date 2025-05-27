import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SearchInput, InfoBox, CustomButton } from '../../components'; // Reutilizar SearchInput y InfoBox
import { findUserByControlNumber } from '../../lib/api'; // Necesitamos esta función en api.js
import { useGlobalContext } from "../../context/GlobalProvider"; // Para verificar el rol de usuario

// Componente para mostrar la información del usuario buscado
const UserCard = ({ user }) => (
  <View className="bg-black-100 p-4 my-3 rounded-lg border border-gray-800">
    <Text className="text-white font-psemibold text-lg">Nombre: {user.fullName}</Text>
    <Text className="text-gray-100 font-pregular text-sm">No. Control: {user.controlNumber}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Carrera: {user.career}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Semestre: {user.semester}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Edad: {user.age}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Rol: {user.role}</Text>
    {/* Aquí podrías añadir botones de acción como "Ver bajas", "Eliminar usuario", etc. */}
  </View>
);

const AdminSearchScreen = () => {
  const { user: currentUser, isLoading: globalLoading } = useGlobalContext(); // User and global loading
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // Null means no search yet, object if found, empty array if not found
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Restrict access to admins only
  if (globalLoading) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#FFA001" />
        <Text className="text-white text-lg mt-4">Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-lg">Acceso denegado. Solo administradores.</Text>
      </SafeAreaView>
    );
  }

  const handleSearch = async (query) => {
    if (!query) {
      Alert.alert("Búsqueda Vacía", "Por favor, ingresa un número de control para buscar.");
      setSearchResults(null); // Clear previous results
      return;
    }

    setLoadingSearch(true);
    try {
      // Assuming findUserByControlNumber returns an object { user: {...} } or null if not found
      const response = await findUserByControlNumber(query);
      if (response && response.user) {
        setSearchResults([response.user]); // Wrap in an array for FlatList
      } else {
        setSearchResults([]); // No user found
        Alert.alert("Usuario No Encontrado", "No se encontró ningún usuario con ese número de control.");
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      Alert.alert("Error de Búsqueda", error.message || "No se pudo buscar el usuario.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold mb-6">Buscar Alumnos (Admin)</Text>

        <SearchInput
          placeholder="Buscar alumno por número de control..."
          value={searchQuery}
          handleChangeText={setSearchQuery}
          onSearchSubmit={handleSearch} // Pass the custom search handler
          otherStyles="mb-4"
        />

        {loadingSearch ? (
          <ActivityIndicator size="large" color="#FFA001" className="mt-8" />
        ) : (
          searchResults !== null && ( // Only show if a search has been performed
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <UserCard user={item} />}
              ListEmptyComponent={() => (
                <Text className="text-white text-center mt-8">
                  {searchQuery ? "No se encontró ningún alumno con ese número de control." : "Realiza una búsqueda para ver resultados."}
                </Text>
              )}
            />
          )
        )}
         {searchResults !== null && searchResults.length === 0 && searchQuery && !loadingSearch && (
            <Text className="text-white text-center mt-8">
              No se encontró ningún alumno con el número de control "{searchQuery}".
            </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminSearchScreen;