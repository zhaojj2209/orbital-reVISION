import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import CalendarScreen from "../screens/CalendarScreen";
import EventFormPage from "../pages/EventFormPage";

const Stack = createStackNavigator();

export default class CalendarContainer extends React.Component {
  render() {
    const { route } = this.props;
    return (
      <Stack.Navigator initialRouteName="Calendar">
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          initialParams={route.params}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="EventForm" component={EventFormPage} />
      </Stack.Navigator>
    );
  }
}
