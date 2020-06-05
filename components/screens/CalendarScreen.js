import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";

import firebase from "../firebaseDb";

export default function CalendarScreen({ route, navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [events, setEvents] = useState(null);
  const { username, userId } = route.params;

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .onSnapshot(
        (querySnapshot) => {
          const results = [];
          querySnapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();
            results.push({
              key: documentSnapshot.id,
              data: {
                title: data.title,
                description: data.description,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
              },
            });
          });
          setIsLoaded(true);
          setEvents(results);
        },
        (err) => console.error(err)
      );
    return unsubscribe;
  });

  const handleDeleteEvent = (eventId) => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .doc(eventId)
      .delete()
      .then(() =>
        Alert.alert("Event Deleted", "", [
          {
            text: "OK",
            onPress: () => {},
          },
        ])
      );
  };

  const welcomeText = "Welcome to the calendar view, " + username + "!";
  return isLoaded ? (
    <SafeAreaView style={styles.container}>
      <Text>{welcomeText}</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.event}>
            <Text style={styles.text}>{item.data.title}</Text>
            <Text style={styles.text}>{item.data.description}</Text>
            <Button
              title="Edit"
              style={styles.button}
              onPress={() =>
                navigation.navigate("EventForm", {
                  userId: userId,
                  isNewEvent: false,
                  event: item,
                })
              }
            />
            <Button
              title="Delete"
              style={styles.button}
              onPress={() =>
                Alert.alert("Confirm delete?", "Event: " + item.data.title, [
                  {
                    text: "OK",
                    onPress: () => handleDeleteEvent(item.key),
                  },
                  {
                    text: "Cancel",
                    onPress: () => {},
                  },
                ])
              }
            />
          </View>
        )}
      />
      <Button
        title="Create New Event"
        style={styles.button}
        onPress={() =>
          navigation.navigate("EventForm", {
            userId: userId,
            isNewEvent: true,
            event: {},
          })
        }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
  },
  event: {
    flexDirection: "row",
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  text: {
    fontSize: 20,
    padding: 10,
  },
  button: {
    marginTop: 42,
  },
});
