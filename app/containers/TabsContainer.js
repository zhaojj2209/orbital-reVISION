import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarContainer from "./CalendarContainer";
import TaskContainer from "./TaskContainer";
import firebase from "../FirebaseDb";

const Tab = createBottomTabNavigator();

export default function TabsContainer({ route }) {
  const user = firebase.auth().currentUser;
  return (
    <Tab.Navigator initialRouteName="Calendar">
      <Tab.Screen
        name="Calendar"
        component={CalendarContainer}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskContainer}
        initialParams={route.params}
      />
    </Tab.Navigator>
  );
}
