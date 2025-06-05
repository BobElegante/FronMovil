// src/app/(tabs)/home.jsx
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";

import { useGlobalContext } from "../../context/GlobalProvider";
import { images, icons } from "../../constants";
import { CustomButton } from "../../components";
import { signOut, getCurrentUser } from "../../lib/api";

const Home = () => {
  const { user, isLoading, setUser, setIsLogged } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const reloadUser = async () => {
    setRefreshing(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLogged(true);
      } else {
        await signOut(); // Limpiar token si no hay usuario
        setUser(null);
        setIsLogged(false);
        router.replace('/sign-in');
      }
    } catch (error) {
      console.error("Error al recargar usuario:", error);
      Alert.alert("Error de Recarga", error.message || "No se pudo actualizar el perfil del usuario.");
      await signOut();
      setUser(null);
      setIsLogged(false);
      router.replace('/sign-in');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Solo recargar si no hay usuario y la carga inicial ha terminado
    if (!isLoading && !user) {
        reloadUser();
    }
  }, [isLoading, user]);

  const onRefresh = async () => {
    await reloadUser();
  };

  if (isLoading || refreshing) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#FFA001" />
        <Text className="text-white text-lg mt-4">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  // --- Componente Home para Estudiantes ---
  const StudentHomeContent = () => {
    const userName = user?.fullName || "Estudiante";

    return (
      <ScrollView
        className="px-4 my-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
        }
      >
        <View className="flex flex-row justify-between items-start mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              ¡Bienvenido de nuevo!
            </Text>
            <Text className="text-2xl text-white font-psemibold">
              {userName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-10 h-10 rounded-lg border border-secondary flex justify-center items-center"
          >
            <Image
              source={icons.profile}
              className="w-6 h-6"
              resizeMode="contain"
              tintColor="#FF9001"
            />
          </TouchableOpacity>
        </View>

        <View className="w-full flex-1 justify-center items-center mt-10">
          <Image
            source={images.logoSmall} // Reemplaza con un logo más apropiado si es necesario
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white font-psemibold text-center mt-7">
            Aquí estará tu contenido principal como estudiante.
          </Text>
          <Text className="text-sm font-pregular text-gray-100 mt-2 text-center">
            Accede a tu información personal o realiza otras acciones disponibles.
          </Text>

          {/* Aquí deberías integrar botones que naveguen a funcionalidades reales del sistema de tutorías */}
          <CustomButton
            title="Ver Expediente"
            handlePress={() => Alert.alert("Navegar", "Navegar a la pantalla de expediente del estudiante. (Requiere desarrollo de pantalla y API).")}
            containerStyles="w-full mt-7"
          />
          <CustomButton
            title="Consultar Historial Académico"
            handlePress={() => Alert.alert("Navegar", "Navegar a la pantalla de historial académico. (Requiere desarrollo de pantalla y API).")}
            containerStyles="w-full mt-4 bg-secondary-100"
          />
        </View>
      </ScrollView>
    );
  };

  // --- Componente Home para Administradores ---
  const AdminHomeContent = () => {
    const userName = user?.fullName || "Administrador";

    const handleLogout = async () => {
      try {
        await signOut();
        setUser(null);
        setIsLogged(false);
        Alert.alert("Sesión cerrada", "Has cerrado sesión exitosamente.");
        router.replace('/sign-in');
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        Alert.alert("Error", "No se pudo cerrar la sesión.");
      }
    };

    return (
      <ScrollView
        className="px-4 my-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
        }
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              ¡Bienvenido, Administrador!
            </Text>
            <Text className="text-2xl text-white font-psemibold">
              {userName}
            </Text>
          </View>
          <View className="mt-1.5">
            <Image
              source={images.logoSmall} // Reemplaza con una imagen adecuada para admin
              className="w-9 h-10"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="w-full flex-1 justify-center items-center mt-10">
          <Image
            source={images.logoSmall}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white font-psemibold text-center mt-7">
            Panel de Administración
          </Text>
          <Text className="text-sm font-pregular text-gray-100 mt-2 text-center">
            Utiliza la barra de navegación inferior para gestionar la aplicación.
          </Text>

          <CustomButton
            title="Gestionar Bajas"
            handlePress={() => router.push("/dropouts")} // Navegar a la pantalla de bajas
            containerStyles="mt-7 w-full"
          />
          <CustomButton
            title="Buscar Alumnos"
            handlePress={() => router.push("/search")} // Navegar a la pantalla de búsqueda de alumnos
            containerStyles="mt-4 w-full bg-secondary-100"
          />
          <CustomButton
            title="Cerrar Sesión"
            handlePress={handleLogout}
            containerStyles="mt-4 w-full bg-red-500"
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      {user?.role === 'admin' ? (
        <AdminHomeContent />
      ) : user?.role === 'student' ? (
        <StudentHomeContent />
      ) : (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-white text-lg text-center">
            No se ha podido determinar el rol del usuario o no estás autenticado.
          </Text>
          <CustomButton
            title="Ir a Inicio de Sesión"
            handlePress={async () => {
              await signOut();
              setUser(null);
              setIsLogged(false);
              router.replace('/sign-in');
            }}
            containerStyles="mt-4 bg-red-500 w-full"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Home;