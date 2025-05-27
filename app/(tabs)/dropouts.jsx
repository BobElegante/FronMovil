import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { FormField, CustomButton, SearchInput } from '../../components'; // Reutilizar componentes
import { registerDropout, getAllDropouts, searchDropoutsByControlNumber } from '../../lib/api'; // Necesitamos crear searchDropoutsByControlNumber
import DateTimePicker from '@react-native-community/datetimepicker'; // Para la fecha
import { format } from 'date-fns'; // Para formatear la fecha
import { useGlobalContext } from "../../context/GlobalProvider";


// Componente para mostrar un elemento de baja (individual)
const DropoutCard = ({ dropout }) => (
  <View className="bg-black-100 p-4 mb-3 rounded-lg border border-gray-800">
    <Text className="text-white font-psemibold text-lg">Baja de: {dropout.full_name}</Text>
    <Text className="text-gray-100 font-pregular text-sm">No. Control: {dropout.control_number}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Tipo de Baja: {dropout.dropout_type}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Periodo de Baja: {dropout.dropout_period}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Periodo de Ausencia: {dropout.absence_period}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Fecha de Baja: {format(new Date(dropout.dropout_date), 'dd/MM/yyyy')}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Razón: {dropout.reason}</Text>
    {/* Puedes añadir más detalles o botones de acción aquí */}
  </View>
);


const DropoutsScreen = () => {
  const { user } = useGlobalContext(); // Para verificar si es admin
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'register'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allDropouts, setAllDropouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Para resultados de búsqueda
  const [showDatePicker, setShowDatePicker] = useState(false); // Para el date picker

  const [form, setForm] = useState({
    userId: '', // control_number del alumno
    dropoutType: '',
    dropoutPeriod: '',
    absencePeriod: '',
    dropoutDate: new Date(),
    reason: '',
  });

  const fetchDropouts = async () => {
    setLoading(true);
    try {
      const response = await getAllDropouts();
      setAllDropouts(response.dropouts || []); // Asume que la API devuelve { dropouts: [...] }
    } catch (error) {
      console.error("Error al obtener bajas:", error);
      Alert.alert("Error", error.message || "No se pudieron cargar las bajas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]); // Limpiar resultados si la query está vacía
      return;
    }
    setLoading(true);
    try {
      const results = await searchDropoutsByControlNumber(query);
      setSearchResults(results.dropouts || []);
    } catch (error) {
      console.error("Error al buscar bajas:", error);
      Alert.alert("Error de Búsqueda", error.message || "No se pudo buscar la baja.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDropouts();
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDropouts();
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.userId || !form.dropoutType || !form.dropoutPeriod || !form.absencePeriod || !form.dropoutDate || !form.reason) {
      return Alert.alert("Error", "Por favor, completa todos los campos.");
    }
    setSubmitting(true);
    try {
      const response = await registerDropout(form);
      Alert.alert("Éxito", response.message);
      // Limpiar formulario y recargar lista
      setForm({
        userId: '',
        dropoutType: '',
        dropoutPeriod: '',
        absencePeriod: '',
        dropoutDate: new Date(),
        reason: '',
      });
      fetchDropouts(); // Recargar la lista de bajas
      setActiveTab('list'); // Volver a la lista después del registro
    } catch (error) {
      console.error("Error al registrar baja:", error);
      Alert.alert("Error", error.message || "Error al registrar la baja.");
    } finally {
      setSubmitting(false);
    }
  };

  // Manejador de cambio de fecha del DatePicker
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || form.dropoutDate;
    setShowDatePicker(false);
    setForm({ ...form, dropoutDate: currentDate });
  };


  if (user?.role !== 'admin') {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-lg">Acceso denegado. Solo administradores.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold mb-6">Gestión de Bajas</Text>

        <View className="flex-row justify-around mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('list')}
            className={`py-2 px-4 rounded-full ${activeTab === 'list' ? 'bg-secondary' : 'bg-gray-700'}`}
          >
            <Text className="text-white font-pmedium">Ver Bajas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('register')}
            className={`py-2 px-4 rounded-full ${activeTab === 'register' ? 'bg-secondary' : 'bg-gray-700'}`}
          >
            <Text className="text-white font-pmedium">Registrar Baja</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'list' ? (
          <View>
            <SearchInput
              placeholder="Buscar baja por # control..."
              value={searchQuery}
              handleChangeText={(text) => {
                setSearchQuery(text);
                // Opcional: Buscar en tiempo real o solo al presionar Enter
                // handleSearch(text);
              }}
              // Para buscar al presionar "Go" en el teclado
              onSubmitEditing={() => handleSearch(searchQuery)}
              otherStyles="mb-4"
            />
             <CustomButton
              title="Buscar"
              handlePress={() => handleSearch(searchQuery)}
              containerStyles="mt-2 mb-4"
              isLoading={loading}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#FFA001" className="mt-8" />
            ) : (
              <FlatList
                data={searchQuery ? searchResults : allDropouts} // Mostrar resultados de búsqueda o todas las bajas
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <DropoutCard dropout={item} />}
                ListEmptyComponent={() => (
                  <Text className="text-white text-center mt-8">
                    {searchQuery ? "No se encontraron bajas para esta búsqueda." : "No hay bajas registradas."}
                  </Text>
                )}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            )}
          </View>
        ) : (
          <View>
            <FormField
              title="Número de Control del Alumno"
              value={form.userId}
              placeholder="Ej: 21940001"
              handleChangeText={(text) => setForm({ ...form, userId: text })}
              otherStyles="mt-4"
              keyboardType="numeric"
            />
            <FormField
              title="Tipo de Baja"
              value={form.dropoutType}
              placeholder="Ej: Temporal, Definitiva, Cambio de carrera"
              handleChangeText={(text) => setForm({ ...form, dropoutType: text })}
              otherStyles="mt-4"
            />
            <FormField
              title="Periodo de Baja"
              value={form.dropoutPeriod}
              placeholder="Ej: Enero-Junio 2024"
              handleChangeText={(text) => setForm({ ...form, dropoutPeriod: text })}
              otherStyles="mt-4"
            />
            <FormField
              title="Periodo de Ausencia"
              value={form.absencePeriod}
              placeholder="Ej: 1 año"
              handleChangeText={(text) => setForm({ ...form, absencePeriod: text })}
              otherStyles="mt-4"
            />

            <View className="mt-4">
              <Text className="text-base text-gray-100 font-pmedium mb-2">Fecha de Baja</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center"
              >
                <Text className="text-white font-pmedium text-base mr-2">
                  {format(form.dropoutDate, 'dd/MM/yyyy')}
                </Text>
                <Image source={icons.calendar} resizeMode="contain" className="w-6 h-6 tint-gray-400" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={form.dropoutDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            <FormField
              title="Razón"
              value={form.reason}
              placeholder="Motivo de la baja..."
              handleChangeText={(text) => setForm({ ...form, reason: text })}
              otherStyles="mt-4"
              multiline
            />

            <CustomButton
              title="Registrar Baja"
              handlePress={handleSubmit}
              containerStyles="mt-7"
              isLoading={submitting}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DropoutsScreen;