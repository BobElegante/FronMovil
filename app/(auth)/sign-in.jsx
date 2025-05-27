import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn } from "../../lib/api"; // <-- ¡Aquí el cambio!
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
      return; // Añadir return para detener la ejecución
    }

    setSubmitting(true);

    try {
      const userData = await signIn(form.controlNumber, form.password);

      setUser(userData); 
      setIsLogged(true);

      Alert.alert("Correcto", "Inicio de sesión exitoso");
      router.replace("/home");
    } catch (error) {
      // Asegúrate de que el mensaje de error venga del backend
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
            secureTextEntry // Asegura que la contraseña se oculte
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
              Registrate
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn; 