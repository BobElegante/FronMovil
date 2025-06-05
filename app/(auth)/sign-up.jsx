// src/app/(auth)/sign-up.jsx
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { createUser } from "../../lib/api";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    password: "",
    fullName: "",
    age: "",
    controlNumber: "",
    career: "",
    semester: "",
  });

  const submit = async () => {
    // Validación de todos los campos
    if (
      form.password === "" ||
      form.fullName === "" ||
      form.age === "" ||
      form.controlNumber === "" ||
      form.career === "" ||
      form.semester === ""
    ) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setSubmitting(true);
    try {
      // Pasa los campos como un objeto JSON para mayor claridad y extensibilidad
      const newUser = await createUser({
        controlNumber: form.controlNumber,
        fullName: form.fullName,
        career: form.career,
        age: parseInt(form.age), // Asegúrate de que 'age' y 'semester' sean números
        semester: parseInt(form.semester),
        password: form.password,
      });

      // Asumiendo que createUser devuelve { token, user } del backend
      setUser(newUser.user);
      setIsLogged(true);

      Alert.alert("Correcto", "Registro exitoso e inicio de sesión automático");
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
            Regístrate ahora en la CoyoteApp
          </Text>

          <FormField
            title="Nombre completo"
            value={form.fullName}
            handleChangeText={(e) => setForm({ ...form, fullName: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Edad"
            value={form.age}
            handleChangeText={(e) => setForm({ ...form, age: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <FormField
            title="Numero de control"
            value={form.controlNumber}
            handleChangeText={(e) => setForm({ ...form, controlNumber: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Carrera"
            value={form.career}
            handleChangeText={(e) => setForm({ ...form, career: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Semestre"
            value={form.semester}
            handleChangeText={(e) => setForm({ ...form, semester: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <FormField
            title="Contraseña"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            secureTextEntry
          />

          <CustomButton
            title="Registrarse"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              ¿Ya estás registrado?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Inicia sesión
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;