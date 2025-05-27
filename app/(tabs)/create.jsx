// import { useState } from "react";
// import { router } from "expo-router";
// import { ResizeMode, Video } from "expo-av";
// import * as ImagePicker from "expo-image-picker";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Alert,
// } from "react-native";

// import { icons } from "../../constants";
// import { CustomButton, FormField } from "../../components";
// // CAMBIO IMPORTANTE: Importar desde tu nuevo archivo de API
// import { createVideoPost } from "../../lib/api"; // <-- ¡Aquí el cambio!
// import { useGlobalContext } from "../../context/GlobalProvider";

// const Create = () => {
//   const { user } = useGlobalContext();
//   const [uploading, setUploading] = useState(false);
//   const [form, setForm] = useState({
//     title: "",
//     video: null,
//     thumbnail: null,
//     prompt: "",
//   });

//   // Funciones para seleccionar video y thumbnail
//   const openPicker = async (selectType) => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes:
//         selectType === "image"
//           ? ImagePicker.MediaTypeOptions.Images
//           : ImagePicker.MediaTypeOptions.Videos,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       if (selectType === "image") {
//         setForm({ ...form, thumbnail: result.assets[0] });
//       }

//       if (selectType === "video") {
//         setForm({ ...form, video: result.assets[0] });
//       }
//     } else {
//       Alert.alert("Documento", "No seleccionaste ningún documento.");
//     }
//   };

//   const submit = async () => {
//     if (!form.prompt || !form.title || !form.thumbnail || !form.video) {
//       return Alert.alert("Por favor, completa todos los campos");
//     }

//     setUploading(true);
//     try {
//       // Pasar el ID del usuario actual al formulario para que el backend lo asocie
//       // (aunque idealmente el backend lo tomaría del JWT)
//       await createVideoPost({
//         ...form,
//         userId: user.id, // Asegúrate de que `user` del contexto tenga un `id`
//       });

//       Alert.alert("Éxito", "Post creado exitosamente");
//       router.push("/home");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <ScrollView className="px-4 my-6">
//         <Text className="text-2xl text-white font-psemibold">Subir Video</Text>

//         <FormField
//           title="Título del video"
//           value={form.title}
//           placeholder="Dale un título a tu video..."
//           handleChangeText={(e) => setForm({ ...form, title: e })}
//           otherStyles="mt-10"
//         />

//         <View className="mt-7 space-y-2">
//           <Text className="text-base text-gray-100 font-pmedium">
//             Subir video
//           </Text>

//           <TouchableOpacity onPress={() => openPicker("video")}>
//             {form.video ? (
//               <Video
//                 source={{ uri: form.video.uri }}
//                 className="w-full h-64 rounded-2xl"
//                 useNativeControls
//                 resizeMode={ResizeMode.COVER}
//                 isLooping
//               />
//             ) : (
//               <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
//                 <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
//                   <Image
//                     source={icons.upload}
//                     resizeMode="contain"
//                     alt="upload"
//                     className="w-1/2 h-1/2"
//                   />
//                 </View>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View className="mt-7 space-y-2">
//           <Text className="text-base text-gray-100 font-pmedium">
//             Miniatura de la imagen
//           </Text>

//           <TouchableOpacity onPress={() => openPicker("image")}>
//             {form.thumbnail ? (
//               <Image
//                 source={{ uri: form.thumbnail.uri }}
//                 resizeMode="cover"
//                 className="w-full h-64 rounded-2xl"
//               />
//             ) : (
//               <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center flex-row space-x-2">
//                 <Image
//                   source={icons.upload}
//                   resizeMode="contain"
//                   alt="upload"
//                   className="w-5 h-5"
//                 />
//                 <Text className="text-sm text-gray-100 font-pmedium">
//                   Elige un archivo
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <FormField
//           title="Prompt de IA"
//           value={form.prompt}
//           placeholder="El prompt que utilizaste para crear este video..."
//           handleChangeText={(e) => setForm({ ...form, prompt: e })}
//           otherStyles="mt-7"
//         />

//         <CustomButton
//           title="Subir y publicar"
//           handlePress={submit}
//           containerStyles="mt-7"
//           isLoading={uploading}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Create;