import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router"; // <-- Importa useLocalSearchParams
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, RefreshControl, Alert } from "react-native"; // Agrega Alert

import { EmptyState, SearchInput, VideoCard } from "../../components";
// CAMBIO IMPORTANTE: Importar desde tu nuevo archivo de API
import { searchPosts, getAllPosts } from "../../lib/api"; // <-- ¡Aquí el cambio!

const Search = () => {
  const { query } = useLocalSearchParams(); // Obtener el parámetro de búsqueda de la URL
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los datos de búsqueda
  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      if (query) { // Solo si hay una query, se busca
        const results = await searchPosts(query); // Llama a tu función de búsqueda del backend
        setPosts(results); // Asume que searchPosts devuelve un array de posts directamente
      } else {
        // Si no hay query, puedes decidir mostrar todos los posts o nada
        // Por ahora, mostraremos todos los posts si no hay query de búsqueda
        const all = await getAllPosts();
        setPosts(all);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message || "Error al obtener resultados de búsqueda.");
      Alert.alert("Error de Búsqueda", err.message || "No se pudieron obtener los resultados.");
    } finally {
      setLoading(false);
      setRefreshing(false); // Asegúrate de que refreshing se ponga en false
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]); // Volver a buscar cuando la query cambie

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSearchResults();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id} // Cambiado de $id a id para tu backend
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            // creator={item.creator?.username} // Ajusta según la estructura de tu backend
            // avatar={item.creator?.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Resultados de búsqueda
            </Text>
            <Text className="text-2xl font-psemibold text-white mt-1">
              {query}
            </Text>

            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Encontrados"
            subtitle="No se encontraron videos para esta búsqueda."
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Search;