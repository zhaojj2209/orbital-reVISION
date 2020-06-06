import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import CalendarScreen from "../screens/CalendarScreen";
import EventFormPage from "../pages/EventFormPage";
import EventDetailsPage from "../pages/EventDetailsPage";

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
        <Stack.Screen name="EventDetails" component={EventDetailsPage} />
      </Stack.Navigator>
    );
  }
}
