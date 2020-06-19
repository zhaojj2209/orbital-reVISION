import React from "react";
import { ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarContainer from "../containers/CalendarContainer";
import TaskScreen from "../screens/TaskScreen";
import firebase from "../FirebaseDb";

const Tab = createBottomTabNavigator();

export default class HomeContainer extends React.Component {
  state = {
    userId: "",
    isLoaded: false,
  };
  componentDidMount() {
    const user = firebase.auth().currentUser;
    this.setState({
      userId: user.uid,
      isLoaded: true,
    });
  }
  render() {
    return this.state.isLoaded ? (
      <Tab.Navigator initialRouteName="Calendar">
        <Tab.Screen
          name="Calendar"
          component={CalendarContainer}
          initialParams={{
            userId: this.state.userId,
          }}
        />
        <Tab.Screen
          name="Tasks"
          component={TaskScreen}
          initialParams={{
            userId: this.state.userId,
          }}
        />
      </Tab.Navigator>
    ) : (
      <ActivityIndicator />
    );
  }
}
