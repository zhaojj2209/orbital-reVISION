import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  Alert,
} from "react-native";
import { format } from "date-fns";

import firebase from "../FirebaseDb";

export default function EventDetailsPage({ route, navigation }) {
  const { userId, event, categories } = route.params;
  const { title, description, startDate, endDate, category } = event.data;

  const handleDeleteEvent = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .doc(event.key)
      .delete()
      .then(() =>
        Alert.alert("Event Deleted", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ])
      );
  };

  const startDateString =
    "Start: " +
    format(startDate, "dd MMM yyyy") +
    ", " +
    format(startDate, "h:mm a");
  const endDateString =
    "End: " + format(endDate, "dd MMM yyyy") + ", " + format(endDate, "h:mm a");

  const categoryString = () => {
    const filtered = categories.filter((cat) => cat.key == category);
    return "Category: " + (filtered.length ? filtered[0].data.title : "None");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.text}>{description}</Text>
        <Text style={styles.text}>{startDateString}</Text>
        <Text style={styles.text}>{endDateString}</Text>
        <Text style={styles.text}>{categoryString()}</Text>
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate("EventForm", {
              userId: userId,
              isNewEvent: false,
              event: event,
              categories: categories,
            })
          }
        />
        <Button
          title="Delete"
          onPress={() =>
            Alert.alert("Confirm delete?", "Event: " + title, [
              {
                text: "OK",
                onPress: () => handleDeleteEvent(event.key),
              },
              {
                text: "Cancel",
                onPress: () => {},
              },
            ])
          }
        />
      </View>
    </SafeAreaView>
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
  text: {
    fontSize: 20,
    padding: 10,
  },
});
