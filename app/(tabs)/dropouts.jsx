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
  ActivityIndicator,
  Image // Asegúrate de importar Image si usas icons.calendar
} from 'react-native';
import { FormField, CustomButton, SearchInput } from '../../components'; // Reutilizar componentes
import { registerDropout, getAllDropouts, searchDropoutsByControlNumber } from '../../lib/api';
// import DateTimePicker from '@react-native-community/datetimepicker'; // ¡YA NO NECESARIO!
// import { format } from 'date-fns'; // ¡YA NO NECESARIO!
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons } from '../../constants'; // Asegúrate de que esta ruta sea correcta para tus iconos


// Componente para mostrar un elemento de baja (individual)
const DropoutCard = ({ dropout }) => (
  <View className="bg-black-100 p-4 mb-3 rounded-lg border border-gray-800">
    <Text className="text-white font-psemibold text-lg">Baja de: {dropout.full_name}</Text>
    <Text className="text-gray-100 font-pregular text-sm">No. Control: {dropout.control_number}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Tipo de Baja: {dropout.dropout_type}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Periodo de Baja: {dropout.dropout_period}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Periodo de Ausencia: {dropout.absence_period}</Text>
    {/* Asegúrate de que dropout.dropout_date sea un string válido en tu backend (ej. 'YYYY-MM-DD') */}
    <Text className="text-gray-100 font-pregular text-sm">Fecha de Baja: {dropout.dropout_date}</Text>
    <Text className="text-gray-100 font-pregular text-sm">Razón: {dropout.reason}</Text>
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
  // const [showDatePicker, setShowDatePicker] = useState(false); // ¡YA NO NECESARIO!

  const [form, setForm] = useState({
    controlNumber: '', // control_number del alumno
    dropoutType: '',
    dropoutPeriod: '',
    absencePeriod: '',
    dropoutDate: '', // Ahora es un string para la entrada manual
    reason: '',
  });

  // Función para validar el formato de fecha 'YYYY-MM-DD'
  const validateDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false; // Formato incorrecto
    }
    // Opcional: Validación adicional para fechas válidas (ej. 2023-02-30 es inválido)
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().slice(0,10) === dateString;
  };


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
      await fetchDropouts(); // Recargar todas las bajas si se borra la búsqueda
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
    // Validaciones
    if (!form.controlNumber || !form.dropoutType || !form.dropoutPeriod || !form.absencePeriod || !form.dropoutDate || !form.reason) {
      return Alert.alert("Error", "Por favor, completa todos los campos.");
    }

    if (!validateDateFormat(form.dropoutDate)) {
        return Alert.alert("Error de Fecha", "El formato de la fecha de baja debe ser AAAA-MM-DD (ej. 2023-01-15).");
    }

    setSubmitting(true);
    try {
      const response = await registerDropout({
        ...form,
        // Aquí no se necesita `new Date()` ni `.toISOString()`, ya que la API espera un string 'YYYY-MM-DD'
        // si seguiste la Opción B en la discusión de `api.js`
        // Si sigues la Opción A, tendrías que hacer: dropoutDate: new Date(form.dropoutDate)
      });
      Alert.alert("Éxito", response.message || "Baja registrada exitosamente.");
      // Limpiar formulario y recargar lista
      setForm({
        controlNumber: '',
        dropoutType: '',
        dropoutPeriod: '',
        absencePeriod: '',
        dropoutDate: '', // Limpiar a string vacío
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
              }} 
              onSubmitEditing={() => handleSearch(searchQuery)}
              otherStyles="mb-4"
            />
             <CustomButton
              title="Buscar"
              handlePress={() => handleSearch(searchQuery)}
              containerStyles="mt-2 mb-4"
              //isLoading={loading && searchQuery} {/* Solo mostrar loading si hay búsqueda activa */}
            />

            {loading && !searchQuery ? ( // Solo mostrar spinner si carga inicial o refresco, no por búsqueda
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
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
                }
              />
            )}
          </View>
        ) : (
          <View>
            <FormField
              title="Número de Control del Alumno"
              value={form.controlNumber}
              placeholder="Ej: 21940001"
              handleChangeText={(text) => setForm({ ...form, controlNumber: text })}
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

            {/* Campo de Fecha de Baja (manual) */}
            <FormField
              title="Fecha de Baja (AAAA-MM-DD)"
              value={form.dropoutDate}
              placeholder="Ej: 2023-01-15"
              handleChangeText={(text) => setForm({ ...form, dropoutDate: text })}
              otherStyles="mt-4"
              keyboardType="number-pad" // O 'default', dependiendo de tu preferencia
            />

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