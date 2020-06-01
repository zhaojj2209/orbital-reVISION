import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
} from "react-native";

import firebase from "../firebaseDb";

export default class CalendarScreen extends React.Component {
  state = { isLoaded: false, events: null };
  componentDidMount() {
    const { route } = this.props;
    const { uid } = route.params;
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("events")
      .get()
      .then((querySnapshot) => {
        const results = [];
        querySnapshot.docs.map((documentSnapshot) =>
          results.push({
            key: documentSnapshot.id,
            data: documentSnapshot.data(),
          })
        );
        this.setState({ isLoaded: true, events: results });
      })
      .catch((err) => console.error(err));
  }
  render() {
    const { route, navigation } = this.props;
    const { username, uid } = route.params;
    const { isLoaded, events } = this.state;
    const welcomeText = "Welcome to the calendar view, " + username + "!";
    return isLoaded ? (
      <SafeAreaView style={styles.container}>
        <Text>{welcomeText}</Text>
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <View>
              <Text>{item.data.title}</Text>
              <Text>{item.data.description}</Text>
            </View>
          )}
        />
        <Button
          title="Create New Event"
          style={styles.button}
          onPress={() => navigation.navigate("CreateEvent", { uid: uid })}
        />
        <Button
          title="Logout"
          style={styles.button}
          onPress={() =>
            firebase
              .auth()
              .signOut()
              .then(() => navigation.navigate("Login"))
          }
        />
      </SafeAreaView>
    ) : (
      <ActivityIndicator />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
