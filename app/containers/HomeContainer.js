import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TabsContainer from "./TabsContainer";
import SleepSchedulePage from "../pages/SleepSchedulePage";
import firebase from "../FirebaseDb";

const Stack = createStackNavigator();

export default function HomeContainer() {
  const user = firebase.auth().currentUser;
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen
        name="Tabs"
        component={TabsContainer}
        initialParams={{
          userId: user.uid,
        }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SleepSchedule"
        component={SleepSchedulePage}
        initialParams={{
          userId: user.uid,
        }}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
