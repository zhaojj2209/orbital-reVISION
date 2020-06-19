import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarContainer from "../containers/CalendarContainer";
import TaskScreen from "../screens/TaskScreen";
import firebase from "../FirebaseDb";

const Tab = createBottomTabNavigator();

export default function HomeContainer() {
  const user = firebase.auth().currentUser;
  return (
    <Tab.Navigator initialRouteName="Calendar">
      <Tab.Screen
        name="Calendar"
        component={CalendarContainer}
        initialParams={{
          userId: user.uid,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskScreen}
        initialParams={{
          userId: user.uid,
        }}
      />
    </Tab.Navigator>
  );
}
