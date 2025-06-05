// src/app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const { user, isLoading } = useGlobalContext();

  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFA001",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#161622",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          height: 84,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.home}
              color={color}
              name="Inicio"
              focused={focused}
            />
          ),
        }}
      />

      {user?.role === "admin" ? (
        <>
          <Tabs.Screen
            name="search" // Asumiendo que 'search' se usará para búsqueda de estudiantes por admin
            options={{
              title: "Buscar",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.search}
                  color={color}
                  name="Buscar"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="dropouts"
            options={{
              title: "Bajas",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.bookmark} // Reutilizando el icono 'bookmark' para bajas
                  color={color}
                  name="Bajas"
                  focused={focused}
                />
              ),
            }}
          />
        </>
      ) : ( // Student specific tabs
        // Si los estudiantes no tienen una funcionalidad de "crear video/contenido",
        // esta pestaña 'create' puede ser eliminada o re-propuesta para otra función.
        // Por ahora, la eliminamos para este contexto de "tutorías" si no hay función equivalente.
        /*
        <Tabs.Screen
          name="create"
          options={{
            title: "Crear",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Crear"
                focused={focused}
              />
            ),
          }}
        />
        */
        // Puedes dejar esta sección vacía o añadir otras pestañas específicas para estudiantes si las necesitas.
        null // Si no hay pestañas específicas para el estudiante, no renderiza nada aquí
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Perfil"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;