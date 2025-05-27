import React from "react"; // Import React
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { icons } from "../constants";

// Add new props: placeholder, onSearchSubmit, value, and handleChangeText
const SearchInput = ({
  initialQuery,
  placeholder = "Buscar videos...", // Default placeholder
  onSearchSubmit, // New prop for custom search logic
  value, // Controlled component value
  handleChangeText, // Controlled component change handler
  otherStyles, // Prop to pass additional styling
}) => {
  const pathname = usePathname();
  // We will now rely on 'value' and 'handleChangeText' from parent for control
  // Remove useState for 'query' if you want it fully controlled by parent
  // If you want it internally managed but still pass initial value, keep useState.
  // For most forms, controlled components are better. Let's make it controlled.
  // const [query, setQuery] = useState(initialQuery || ""); // Removing internal state

  return (
    <View className={`flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary ${otherStyles}`}>
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={value} // Use the value prop
        placeholder={placeholder} // Use the placeholder prop
        placeholderTextColor="#CDCDE0"
        onChangeText={handleChangeText} // Use the handleChangeText prop
        // Add onSubmitEditing to trigger search when pressing "Done" or "Go" on keyboard
        onSubmitEditing={() => {
          if (value === "") {
            Alert.alert("Búsqueda Vacía", "Por favor, ingresa algo para buscar.");
            return;
          }
          if (onSearchSubmit) {
            onSearchSubmit(value); // Call the custom handler if provided
          } else {
            // Default behavior (for video search, if still needed)
            if (pathname.startsWith("/search")) {
              router.setParams({ query: value });
            } else {
              router.push(`/search/${value}`);
            }
          }
        }}
      />

      <TouchableOpacity
        onPress={() => {
          if (value === "") {
            Alert.alert("Búsqueda Vacía", "Por favor, ingresa algo para buscar.");
            return;
          }
          if (onSearchSubmit) {
            onSearchSubmit(value); // Call the custom handler if provided
          } else {
            // Default behavior (for video search, if still needed)
            if (pathname.startsWith("/search")) {
              router.setParams({ query: value });
            } else {
              router.push(`/search/${value}`);
            }
          }
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;