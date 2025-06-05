// src/app/(auth)/sign-in.jsx
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { signIn } from "../../lib/api"; // ELIMINADO: getCurrentUser
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    controlNumber: "",
    password: "",
  });

  const submit = async () => {
    if (form.controlNumber === "" || form.password === "") {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setSubmitting(true);

    try {
      // Asumiendo que signIn ahora devuelve { token, user }
      const { user: userData, token } = await signIn(form.controlNumber, form.password);

      // Almacenar el token, por ejemplo, en AsyncStorage si lo necesitas para futuras peticiones
      // await AsyncStorage.setItem('userToken', token); // Si estás usando AsyncStorage

      setUser(userData);
      setIsLogged(true);

      Alert.alert("Correcto", "Inicio de sesión exitoso");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logotec}
            resizeMode="contain"
            className="w-[185px] h-[110px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Inicia sesión en la CoyoteApp
          </Text>

          <FormField
            title="Numero de control"
            value={form.controlNumber}
            handleChangeText={(e) => setForm({ ...form, controlNumber: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Contraseña"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            secureTextEntry
          />

          <CustomButton
            title="Iniciar sesión"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              ¿No estás registrado?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Regístrate
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;