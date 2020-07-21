import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import firebase from "../FirebaseDb";
import * as Notifications from "expo-notifications";

import moment from "moment";

export default function TaskInputPage({ route, navigation }) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { userId, onGoBack, isNewTask, task } = route.params;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const inputSchema = yup.object({
    title: yup.string().required(),
    importance: yup
      .string()
      .required()
      .test("is-num-1-5", "Input must be integer from 1 - 5", (val) => {
        return (
          parseInt(val) < 6 &&
          parseInt(val) > 0 &&
          Number(val) - parseInt(val) === 0
        );
      }),

    expectedCompletionTime: yup
      .string()
      .required()
      .test("isNumber", "Input must be a number", (val) => {
        return !isNaN(Number(val));
      }),
  });

  async function scheduleNotif(title, expectedCompletionTime, deadline) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: title + " is due soon!",
        body:
          moment(deadline, "MMMM Do YYYY, h:mm a").diff(moment(), "minutes") /
            60 <
          expectedCompletionTime
            ? "Deadline of task in " +
              (
                moment(deadline, "MMMM Do YYYY, h:mm a").diff(
                  moment(),
                  "minutes"
                ) / 60
              ).toFixed(2) +
              " hour(s)"
            : "Deadline of task in " + expectedCompletionTime + " hour(s)",
      },
      trigger:
        moment(deadline, "MMMM Do YYYY, h:mm a").diff(moment(), "minutes") /
          60 <
        expectedCompletionTime
          ? null
          : moment(deadline, "MMMM Do YYYY, h:mm a")
              .subtract({
                hours: expectedCompletionTime,
              })
              .toDate(),
    });
    return identifier;
  }

  function getIdentifier() {
    const oldIdentifier = "";
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(task.key)
      .get()
      .then((doc) => {
        const { identifier } = doc.data();
        oldIdentifier = identifier;
        console.log(oldIdentifier);
      });
    return oldIdentifier;
  }

  async function rescheduleNotif(
    oldIdentifier,
    title,
    expectedCompletionTime,
    deadline
  ) {
    await Notifications.cancelScheduledNotificationAsync(oldIdentifier);
    return scheduleNotif(title, expectedCompletionTime, deadline);
  }

  const handleCreateTask = async (values) => {
    let identifier = await scheduleNotif(
      values.title,
      values.expectedCompletionTime,
      values.deadline
    );
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .add({
        title: values.title,
        description: values.description,
        importance: values.importance,
        expectedCompletionTime: values.expectedCompletionTime,
        deadline: values.deadline,
        identifier: identifier,
      })
      .then(() =>
        Alert.alert("Task Created", "", [
          {
            text: "OK",
            onPress: () => {
              onGoBack();
              navigation.navigate("TaskList");
            },
          },
        ])
      )
      .catch((err) => console.error(err));
  };

  const handleEditTask = async (values) => {
    const oldIdentifier = getIdentifier();
    let newIdentifer = await rescheduleNotif(
      oldIdentifier,
      values.title,
      values.expectedCompletionTime,
      values.deadline
    );
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(task.key)
      .set({
        title: values.title,
        description: values.description,
        importance: values.importance,
        expectedCompletionTime: values.expectedCompletionTime,
        deadline: values.deadline,
        identifier: newIdentifer,
      })
      .then(() =>
        Alert.alert("Task Edited", "", [
          {
            text: "OK",
            onPress: () => {
              onGoBack();
              navigation.navigate("TaskList");
            },
          },
        ])
      )
      .catch((err) => console.error(err));
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Formik
          initialValues={
            isNewTask
              ? {
                  title: "",
                  description: "",
                  importance: "",
                  expectedCompletionTime: "",
                  deadline: moment().format("MMMM Do YYYY, h:mm a"),
                }
              : {
                  title: task.data.title,
                  description: task.data.description,
                  importance: task.data.importance,
                  expectedCompletionTime: task.data.expectedCompletionTime,
                  deadline: task.data.deadline,
                }
          }
          validationSchema={inputSchema}
          onSubmit={(values) => {
            isNewTask ? handleCreateTask(values) : handleEditTask(values);
          }}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            handleBlur,
            setFieldValue,
            touched,
            errors,
          }) => (
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Title"
                onChangeText={handleChange("title")}
                value={values.title}
                onBlur={handleBlur("title")}
              />
              <Text style={styles.errorText}>
                {touched.title && errors.title}
              </Text>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Description (Optional)"
                onChangeText={handleChange("description")}
                value={values.description}
              />
              <Text style={styles.errorText}>{errors.description}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Importance (1 - 5)"
                onChangeText={handleChange("importance")}
                value={values.importance}
                keyboardType="numeric"
                onBlur={handleBlur("importance")}
              />
              <Text style={styles.errorText}>
                {touched.importance && errors.importance}
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Expected Completion Time (hours)"
                onChangeText={handleChange("expectedCompletionTime")}
                value={values.expectedCompletionTime}
                keyboardType="numeric"
                onBlur={handleBlur("expectedCompletionTime")}
              />
              <Text style={styles.errorText}>
                {touched.expectedCompletionTime &&
                  errors.expectedCompletionTime}
              </Text>
              <View style={styles.dates}>
                <Text style={styles.dateText}>Deadline: </Text>
                <Text onPress={showDatePicker} style={styles.dateText}>
                  {values.deadline}
                </Text>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="datetime"
                  minuteInterval={15}
                  onConfirm={(deadline) => {
                    setFieldValue(
                      "deadline",
                      moment(deadline).format("MMMM Do YYYY, h:mm a")
                    );
                    hideDatePicker();
                  }}
                  onCancel={hideDatePicker}
                  date={moment(
                    values.deadline,
                    "MMMM Do YYYY, h:mm a"
                  ).toDate()}
                />
              </View>
              <Button title="Submit" onPress={handleSubmit} />
            </View>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    padding: 10,
    width: 300,
  },
  dateText: {
    fontSize: 20,
  },
  errorText: { marginBottom: 10, marginTop: 6, textAlign: "center" },
});
