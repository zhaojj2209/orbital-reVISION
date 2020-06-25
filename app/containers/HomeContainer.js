import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarContainer from "../containers/CalendarContainer";
import TaskContainer from "../containers/TaskContainer";
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
        component={TaskContainer}
        initialParams={{
          userId: user.uid,
        }}
      />
    </Tab.Navigator>
  );
}
