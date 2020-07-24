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
import { useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import firebase, {
  getEventsDb,
  getCategoriesDb,
  getSleepSchedule,
} from "../FirebaseDb";
import {
  formatTime,
  formatDateString,
  formatDateObject,
  getDays,
  getMinutes,
  today,
} from "../constants/DateFormats";
import { categoryColours } from "../constants/Colours";

export default function CalendarScreen({ route, navigation }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agendaItems, setAgendaItems] = useState({});
  const todayObject = formatDateObject(today);
  const { userId } = route.params;
  const bufferTime = getMinutes(15);
  const minimumSessionTime = getMinutes(30);
  const isFocused = useIsFocused();

  useEffect(() => refreshData(), [isFocused]);

  useEffect(() => loadItems(todayObject), [events]);

  const eventsDb = getEventsDb(userId);
  const categoriesDb = getCategoriesDb(userId);
  const sleepSchedule = getSleepSchedule(userId);

  const refreshData = () => {
    if (isFocused) {
      setAgendaItems({});
      getEvents();
      getCategories();
    }
  };

  const getEvents = () => {
    eventsDb
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
              repeat: data.repeat,
              repeatId: data.repeatId,
              repeatDate:
                data.repeatDate == null ? null : data.repeatDate.toDate(),
              taskId: data.taskId,
            },
          });
        });
        setEvents(results);
      })
      .catch((err) => console.error(err));
  };

  const getCategories = () => {
    categoriesDb
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
        ? categoryColours.none
        : categoryColours.studySession,
    };
  };

  const timeToString = (time) => formatDateString(new Date(time));

  async function scheduleEventNotif(title, startDate) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title:
          title +
          " is in " +
          (moment(startDate, "T00:00:00.000+08:00").diff(moment(), "minutes") <
          30
            ? moment(startDate, "T00:00:00.000+08:00").diff(
                moment(),
                "minutes"
              ) + " minutes!"
            : "30 minutes!"),
      },
      trigger:
        moment(startDate, "T00:00:00.000+08:00").diff(moment(), "minutes") < 30
          ? null
          : moment(startDate, "T00:00:00.000+08:00")
              .subtract({ minutes: 30 })
              .toDate(),
    });
    return identifier;
  }
  const scheduleStudySessions = () => {
    sleepSchedule
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          const { wakeTime, sleepTime } = doc.data();
          for (let i = 1; i <= 7; i++) {
            const dayStart = todayObject.timestamp + getDays(i) + wakeTime;
            const dayEnd = todayObject.timestamp + getDays(i) + sleepTime;
            const dayEvents = agendaItems[timeToString(dayStart)];
            let nextSessionTime = dayStart;
            for (let j = 0; j < dayEvents.length; j++) {
              const nextEvent = dayEvents[j];
              const { startDate, endDate } = nextEvent.data;
              const sessionStart = nextSessionTime;
              const sessionEnd = startDate.getTime() - bufferTime;
              nextSessionTime = endDate.getTime() + bufferTime;
              if (sessionEnd - sessionStart > minimumSessionTime) {
                const identifier = await scheduleEventNotif(
                  "Study Session",
                  new Date(sessionStart)
                );
                eventsDb
                  .add({
                    title: "Study Session",
                    description: "Time to get work done!",
                    startDate: new Date(sessionStart),
                    endDate: new Date(sessionEnd),
                    category: "Study Session",
                    repeat: "None",
                    repeatId: "",
                    repeatDate: null,
                    identifier: identifier,
                    taskId: null,
                  })
                  .catch((err) => console.error(err));
              }
            }
            if (
              dayEnd > nextSessionTime &&
              dayEnd - nextSessionTime >= minimumSessionTime
            ) {
              const identifier = await scheduleEventNotif(
                "Study Session",
                new Date(nextSessionTime)
              );
              eventsDb
                .add({
                  title: "Study Session",
                  description: "Time to get work done!",
                  startDate: new Date(nextSessionTime),
                  endDate: new Date(dayEnd),
                  category: "Study Session",
                  repeat: "None",
                  repeatId: "",
                  repeatDate: null,
                  identifier: identifier,
                  taskId: null,
                })
                .catch((err) => console.error(err));
            }
          }
        }
      })
      .then(() =>
        Alert.alert("Study sessions scheduled", "", [
          {
            text: "OK",
            onPress: refreshData,
          },
        ])
      )
      .catch((err) => console.error(err));
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
              <Text> </Text>
            </View>
          );
        }}
        rowHasChanged={(r1, r2) => {
          return r1.key !== r2.key;
        }}
        onRefresh={refreshData}
        style={{ flex: 1 }}
      />

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("EventForm", {
              userId: userId,
              isNewEvent: true,
              event: {},
              categories: categories,
            })
          }
        >
          <Entypo name="add-to-list" size={20} color="#ff7e67" />
          <Text style={styles.buttonText}>Add Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
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
        >
          <Feather name="book-open" size={20} color="#ff7e67" />
          <Text style={styles.buttonText}>Schedule Study Sessions</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("SleepSchedule", {
              userId: userId,
            })
          }
        >
          <MaterialCommunityIcons
            name="power-sleep"
            size={20}
            color="#ff7e67"
          />
          <Text style={styles.buttonText}>Sleep Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("CategoryList", {
              userId: userId,
            })
          }
        >
          <AntDesign name="bars" size={20} color="#ff7e67" />
          <Text style={styles.buttonText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Alert.alert("Confirm logout?", "", [
              {
                text: "OK",
                onPress: () =>
                  firebase
                    .auth()
                    .signOut()
                    .then(() => navigation.navigate("Login")),
              },
              {
                text: "Cancel",
                onPress: () => {},
              },
            ])
          }
        >
          <Feather name="log-out" size={20} color="#ff7e67" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
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
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 6,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
  },
  text: {
    fontSize: 20,
    padding: 10,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  button: {
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonText: { fontSize: 16, paddingLeft: 5, color: "#ff7e67" },
  emptyDate: {
    height: 15,
    flex: 1,
    marginTop: 52,
    borderTopWidth: 1,
    borderTopColor: "#a2d5f2",
    borderStyle: "solid",
  },
});
