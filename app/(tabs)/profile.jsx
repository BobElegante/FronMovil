// src/app/(tabs)/profile.jsx
import React, { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, TouchableOpacity, Text, ScrollView, ActivityIndicator, Alert } from "react-native"; // Import Alert
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../lib/api";

import { icons } from "../../constants";
import { InfoBox } from "../../components";

const Profile = () => {
  const { user, setUser, setIsLogged, isLoading } = useGlobalContext();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const logout = async () => {
    setLoadingLogout(true);
    try {
      await signOut();
      setUser(null);
      setIsLogged(false);
      Alert.alert("Sesión cerrada", "Has cerrado sesión exitosamente."); // Feedback al usuario
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    } finally {
      setLoadingLogout(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#FFA001" />
        <Text className="text-white text-lg mt-4">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (user?.role === "student") {
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

            {/* Avatar (opcional: si tu sistema de tutorías no usa avatares, considera un icono genérico) */}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={icons.profile} // Usar un icono genérico si no hay avatar en tu backend
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
                tintColor="#FF9001" // Color del icono
              />
              {/* Si tu backend proporciona URL de avatar, usa: source={{ uri: user?.avatar || icons.profile }} */}
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

            {/* Avatar para Admin (opcional, considera un icono genérico si no hay avatares) */}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={icons.profile} // Usar un icono genérico si no hay avatar
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
                tintColor="#FF9001"
              />
            </View>

            <InfoBox
              title={`Administrador: ${user?.fullName || "N/A"}`}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
             <InfoBox
              title={user?.controlNumber || "N/A"}
              subtitle="Número de Control Admin"
              containerStyles="mt-2"
              titleStyles="text-base"
            />
          </View>
          {/* Aquí podrías añadir componentes específicos para el administrador si los necesitas en esta pantalla */}
          {/* Ej: Un botón para navegar a la pantalla de gestión de bajas si no está en las pestañas */}
          {/* <CustomButton
            title="Ir a Gestión de Bajas"
            handlePress={() => router.push("/dropouts")}
            containerStyles="mt-5 w-full"
          /> */}
        </ScrollView>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-lg">Usuario no reconocido o no autenticado.</Text>
        <TouchableOpacity
          onPress={logout} // Intenta logout para limpiar token residual
          className="mt-5 p-3 bg-secondary rounded-lg"
        >
          <Text className="text-white">Volver a Iniciar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

export default Profile;