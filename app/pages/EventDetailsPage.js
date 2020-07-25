import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";

import { getEventsDb } from "../FirebaseDb";
import { formatDateDisplay, formatDate } from "../constants/DateFormats";
import moment from "moment";

export default function EventDetailsPage({ route, navigation }) {
  const { userId, event, categories } = route.params;
  const {
    title,
    description,
    startDate,
    endDate,
    category,
    repeat,
    repeatDate,
    repeatId,
    identifier,
  } = event.data;

  const eventsDb = getEventsDb(userId);

  const handleDeleteEvent = async () => {
    if (
      moment().isBefore(
        moment(startDate, "T00:00:00.000+08:00").subtract({ minutes: 30 })
      )
    ) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
    eventsDb
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

  const handleDeleteAllEvents = () => {
    eventsDb
      .where("repeatId", "==", repeatId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach(async (documentSnapshot) => {
          if (
            moment().isBefore(
              moment(
                documentSnapshot.data().startDate,
                "T00:00:00.000+08:00"
              ).subtract({ minutes: 30 })
            )
          ) {
            await Notifications.cancelScheduledNotificationAsync(
              documentSnapshot.data().identifier
            );
          }
          documentSnapshot.ref.delete();
        });
      })
      .then(() =>
        Alert.alert("Event Deleted", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ])
      );
  };

  const startDateString = "Start: " + formatDateDisplay(startDate);
  const endDateString = "End: " + formatDateDisplay(endDate);

  const categoryString = () => {
    const filtered = categories.filter((cat) => cat.key == category);
    return (
      "Category: " +
      (filtered.length
        ? filtered[0].data.title
        : category.length == 0
        ? "None"
        : "Study Session")
    );
  };

  const repeatString =
    "Repeat: " +
    repeat +
    (repeat != "None" ? " until " + formatDate(repeatDate) : "");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.text}>Title: {title}</Text>
        <Text style={styles.text}>
          Description: {description.length ? description : "No description"}
        </Text>
        <Text style={styles.text}>{startDateString}</Text>
        <Text style={styles.text}>{endDateString}</Text>
        <Text style={styles.text}>{categoryString()}</Text>
        <Text style={styles.text}>{repeatString}</Text>
        <View style={styles.buttonRow}>
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
              repeat == "None"
                ? Alert.alert("Confirm delete?", "Event: " + title, [
                    {
                      text: "OK",
                      onPress: () => handleDeleteEvent(),
                    },
                    {
                      text: "Cancel",
                      onPress: () => {},
                    },
                  ])
                : Alert.alert("Delete all repeated events?", "", [
                    {
                      text: "All events",
                      onPress: () => handleDeleteAllEvents(),
                    },
                    {
                      text: "This event",
                      onPress: () => handleDeleteEvent(),
                    },
                    {
                      text: "Cancel",
                      onPress: () => {},
                    },
                  ])
            }
          />
        </View>
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
  details: {
    padding: 40,
  },
  text: {
    fontSize: 18,
    padding: 10,
    color: "#07689f",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
