import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CalendarPage from "./CalendarPage";
import TaskPage from "./TaskPage";
import firebase from "../firebaseDb";

const Tab = createBottomTabNavigator();

export default class Homepage extends React.Component {
  state = {
    username: "",
    isLoaded: false,
  };
  componentDidMount() {
    const user = firebase.auth().currentUser;
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) =>
        this.setState({
          username: doc.data().username,
          isLoaded: true,
        })
      );
  }
  render() {
    return this.state.isLoaded ? (
      <Tab.Navigator initialRouteName="Calendar">
        <Tab.Screen
          name="Calendar"
          component={CalendarPage}
          initialParams={this.state}
        />
        <Tab.Screen
          name="Tasks"
          component={TaskPage}
          initialParams={this.state}
        />
      </Tab.Navigator>
    ) : null;
  }
}
