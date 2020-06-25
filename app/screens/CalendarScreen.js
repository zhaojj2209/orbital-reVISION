import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Agenda } from "react-native-calendars";

import firebase from "../FirebaseDb";
import {
  formatTime,
  formatDateString,
  formatDateObject,
  getDays,
  getHours,
  getMinutes,
} from "../constants/DateFormats";

export default function CalendarScreen({ route, navigation }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agendaItems, setAgendaItems] = useState({});
  const today = formatDateObject(new Date(formatDateString(new Date())));
  const { userId } = route.params;
  const wakeTime = getHours(0);
  const sleepTime = getHours(16);
  const bufferTime = getMinutes(15);
  const minimumSessionTime = getMinutes(30);

  useEffect(() => refreshData(), [userId]);

  useEffect(() => loadItems(today), [events]);

  const refreshData = () => {
    setAgendaItems({});
    getEvents();
    getCategories();
  };

  const getEvents = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .orderBy("startDate")
      .get()
      .then((querySnapshot) => {
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
              category: data.category,
            },
          });
        });
        setEvents(results);
      })
      .catch((err) => console.error(err));
  };

  const getCategories = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .get()
      .then((querySnapshot) => {
        const results = [];
        querySnapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data();
          results.push({
            key: documentSnapshot.id,
            data: {
              title: data.title,
              colour: data.colour,
            },
          });
        });
        setCategories(results);
      })
      .catch((err) => console.error(err));
  };

  const getCategoryColour = (categoryId) => {
    const filtered = categories.filter((cat) => cat.key == categoryId);
    return {
      backgroundColor: filtered.length
        ? filtered[0].data.colour
        : categoryId.length == 0
        ? "#f9c2ff"
        : "#ff6d01",
    };
  };

  const timeToString = (time) => formatDateString(new Date(time));

  const scheduleStudySessions = () => {
    for (let i = 1; i <= 7; i++) {
      const dayStart = today.timestamp + getDays(i) + wakeTime;
      const dayEnd = today.timestamp + getDays(i) + sleepTime;
      const dayEvents = agendaItems[timeToString(dayStart)];
      let nextSessionTime = dayStart;
      for (let j = 0; j < dayEvents.length; j++) {
        const nextEvent = dayEvents[j];
        const { startDate, endDate } = nextEvent.data;
        const sessionStart = nextSessionTime;
        const sessionEnd = startDate.getTime() - bufferTime;
        nextSessionTime = endDate.getTime() + bufferTime;
        if (sessionEnd - sessionStart > minimumSessionTime) {
          firebase
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("events")
            .add({
              title: "Study Session",
              description: "Time to get work done!",
              startDate: new Date(sessionStart),
              endDate: new Date(sessionEnd),
              category: "Study Session",
            })
            .catch((err) => console.error(err));
        }
      }
      if (
        dayEnd > nextSessionTime &&
        dayEnd - nextSessionTime > minimumSessionTime
      ) {
        firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("events")
          .add({
            title: "Study Session",
            description: "Time to get work done!",
            startDate: new Date(nextSessionTime),
            endDate: new Date(dayEnd),
            category: "Study Session",
          })
          .catch((err) => console.error(err));
      }
      Alert.alert("Study sessions scheduled", "", [
        {
          text: "OK",
          onPress: refreshData,
        },
      ]);
    }
  };

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i <= 15; i++) {
        const time = day.timestamp + getDays(i);
        const strTime = timeToString(time);
        agendaItems[strTime] = [];
        const filtered = events.filter((item) => {
          return formatDateString(item.data.startDate) == strTime;
        });
        for (let j = 0; j < filtered.length; j++) {
          agendaItems[strTime].push(filtered[j]);
        }
      }
      const newItems = {};
      Object.keys(agendaItems).forEach((key) => {
        newItems[key] = agendaItems[key];
      });
      setAgendaItems(newItems);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={agendaItems}
        loadItemsForMonth={loadItems}
        onDayChange={loadItems}
        selected={formatDateString(new Date())}
        pastScrollRange={6}
        futureScrollRange={6}
        renderItem={(item) => {
          return (
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.event,
                getCategoryColour(item.data.category),
              ])}
              onPress={() =>
                navigation.navigate("EventDetails", {
                  userId: userId,
                  event: item,
                  categories: categories,
                  onGoBack: refreshData,
                })
              }
            >
              <Text style={styles.text}>{item.data.title}</Text>
              <Text style={styles.text}>
                {formatTime(item.data.startDate) +
                  " - " +
                  formatTime(item.data.endDate)}
              </Text>
            </TouchableOpacity>
          );
        }}
        renderEmptyDate={() => {
          return (
            <View style={styles.emptyDate}>
              <Text style={styles.text}>Nothing scheduled!</Text>
            </View>
          );
        }}
        rowHasChanged={(r1, r2) => {
          return r1.key !== r2.key;
        }}
        onRefresh={refreshData}
        style={{ flex: 1 }}
      />
      <Button
        title="Schedule Study Sessions"
        style={styles.button}
        onPress={() =>
          Alert.alert("Confirm schedule?", "", [
            {
              text: "OK",
              onPress: scheduleStudySessions,
            },
            {
              text: "Cancel",
              onPress: () => {},
            },
          ])
        }
      />
      <View style={styles.bottom}>
        <Button
          title="Create New Event"
          style={styles.button}
          onPress={() =>
            navigation.navigate("EventForm", {
              userId: userId,
              isNewEvent: true,
              event: {},
              categories: categories,
              onGoBack: refreshData,
            })
          }
        />
        <Button
          title="Categories"
          style={styles.button}
          onPress={() =>
            navigation.navigate("CategoryList", {
              userId: userId,
              onGoBack: refreshData,
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  event: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  text: {
    fontSize: 20,
    padding: 10,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
