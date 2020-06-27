import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarContainer from "./CalendarContainer";
import TaskContainer from "./TaskContainer";
import firebase from "../FirebaseDb";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabsContainer({ route }) {
  const user = firebase.auth().currentUser;
  return (
    <Tab.Navigator
      initialRouteName="Calendar"
      tabBarOptions={{
        activeTintColor: "#e91e63",
        inactiveTintColor: "grey",
      }}
    >
      <Tab.Screen
        name="Calendar"
        component={CalendarContainer}
        initialParams={route.params}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-multiselect"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskContainer}
        initialParams={route.params}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="tasklist" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
