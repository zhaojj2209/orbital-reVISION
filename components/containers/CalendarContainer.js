import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import CalendarScreen from "../screens/CalendarScreen";
import EventFormPage from "../pages/EventFormPage";
import EventDetailsPage from "../pages/EventDetailsPage";
import CategoryFormPage from "../pages/CategoryFormPage";
import CategoryListPage from "../pages/CategoryListPage";

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
        <Stack.Screen name="EventDetails" component={EventDetailsPage} />
        <Stack.Screen name="EventForm" component={EventFormPage} />
        <Stack.Screen name="CategoryList" component={CategoryListPage} />
        <Stack.Screen name="CategoryForm" component={CategoryFormPage} />
      </Stack.Navigator>
    );
  }
}
