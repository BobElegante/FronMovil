import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, TouchableOpacity, Text, ScrollView, ActivityIndicator } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../lib/api"; // Only need signOut here now

import { icons } from "../../constants"; // Assuming icons are defined here
import { InfoBox } from "../../components"; // InfoBox is still useful

const Profile = () => {
  const { user, setUser, setIsLogged, isLoading } = useGlobalContext(); // Access isLoading from GlobalProvider
  const [loadingLogout, setLoadingLogout] = useState(false); // State for logout button loading

  const logout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(); // Call the signOut function from your api.js
      setUser(null);
      setIsLogged(false);
      // Alert.alert("Sesión cerrada", "Has cerrado sesión exitosamente."); // Optional: alert on success
      router.replace("/sign-in"); // Navigate to the sign-in screen
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    } finally {
      setLoadingLogout(false);
    }
  };

  // Show a loading state while user context is being loaded
  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#FFA001" />
        <Text className="text-white text-lg mt-4">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  // Render based on user role
  if (user?.role === "student") {
    return (
      <SafeAreaView className="bg-primary h-full">
        <ScrollView className="px-4 my-6">
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
              disabled={loadingLogout} // Disable button while logging out
            >
              {loadingLogout ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  source={icons.logout}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              )}
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.fullName || "Estudiante"}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <InfoBox
              title={user?.controlNumber || "N/A"}
              subtitle="Número de Control"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
            <InfoBox
              title={user?.career || "N/A"}
              subtitle="Carrera"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
            <InfoBox
              title={user?.semester?.toString() || "N/A"}
              subtitle="Semestre"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
            <InfoBox
              title={user?.age?.toString() || "N/A"}
              subtitle="Edad"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } else if (user?.role === "admin") {
    return (
      <SafeAreaView className="bg-primary h-full">
        <ScrollView className="px-4 my-6">
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
              disabled={loadingLogout}
            >
               {loadingLogout ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  source={icons.logout}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              )}
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={`Administrador: ${user?.fullName || "N/A"}`}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            {/* Si el administrador tiene un número de control, puedes mostrarlo también */}
             <InfoBox
              title={user?.controlNumber || "N/A"}
              subtitle="Número de Control Admin"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
            {/* Otros detalles específicos del administrador, si los hay */}
          </View>
          {/* Aquí podrías añadir componentes específicos para el administrador si los necesitas en esta pantalla */}
          <View className="mt-10">
            <Text className="text-white text-xl font-psemibold">Funciones de Administrador</Text>
            {/* Por ejemplo, un botón para navegar a la pantalla de gestión de bajas */}
            {/* <CustomButton
              title="Gestionar Bajas"
              handlePress={() => router.push("/admin/dropouts")} // Esto apunta a la nueva ruta
              containerStyles="mt-5"
            /> */}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } else {
    // Fallback or loading state if user is null or role is undefined
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-lg">Usuario no reconocido o no autenticado.</Text>
        <TouchableOpacity
          onPress={logout}
          className="mt-5 p-3 bg-secondary rounded-lg"
        >
          <Text className="text-white">Volver a Iniciar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

export default Profile;