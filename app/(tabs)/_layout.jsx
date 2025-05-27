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

      {user?.role === "admin" ? ( // Conditional rendering for admin tabs
        <>
          <Tabs.Screen
            name="search" // <--- POINTS TO THE NEW AdminSearchScreen
            options={{
              title: "Buscar",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.search} // Using search icon
                  color={color}
                  name="Buscar"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="dropouts" // <--- POINTS TO THE NEW DropoutsScreen
            options={{
              title: "Bajas",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.bookmark} // Reusing bookmark icon for bajas
                  color={color}
                  name="Bajas"
                  focused={focused}
                />
              ),
            }}
          />
        </>
      ) : ( // Student specific tabs
        <>
          {/* If students have a 'create' tab for videos, it would go here */}
          {/* For now, assuming only admin gets 'search' and 'dropouts' */}
          <Tabs.Screen
            name="create" // Original 'create' tab, maybe for video upload
            options={{
              title: "Crear",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.plus} // Use plus icon for create
                  color={color}
                  name="Crear"
                  focused={focused}
                />
              ),
            }}
          />
        </>
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