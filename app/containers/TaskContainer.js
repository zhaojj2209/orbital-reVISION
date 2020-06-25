import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TaskListScreen from "../screens/TaskListScreen";
import TaskInputPage from "../pages/TaskInputPage";
import TaskDetailsPage from "../pages/TaskDetailsPage";

const Stack = createStackNavigator();

export default function CalendarContainer({ route }) {
  return (
    <Stack.Navigator initialRouteName="TaskList">
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="TaskInput" component={TaskInputPage} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsPage} />
    </Stack.Navigator>
  );
}
