import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  Picker,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";
import moment from "moment";
import { getTasksDb } from "../FirebaseDb";

import {
  newRoundedDate,
  formatDate,
  formatDateString,
  formatDateDisplay,
  today,
} from "../constants/DateFormats";

export default function TaskInputPage({ route, navigation }) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showRepeatDatePicker, setShowRepeatDatePicker] = useState(false);
  const { userId, isNewTask, task } = route.params;
  const tasksDb = getTasksDb(userId);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const inputSchema = yup.object({
    title: yup.string().required("Title cannot be left blank!"),
    importance: yup
      .string()
      .required("Importance cannot be left blank!")
      .test("is-num-1-5", "Input must be integer from 1 - 5", (val) => {
        return (
          parseInt(val) < 6 &&
          parseInt(val) > 0 &&
          Number(val) - parseInt(val) === 0
        );
      }),

    expectedCompletionTime: yup
      .string()
      .required("Required time cannot be left blank!")
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

  const handleCreateTask = async (values) => {
    let identifier = await scheduleNotif(
      values.title,
      values.expectedCompletionTime,
      values.deadline
    );
    tasksDb
      .add({
        title: values.title,
        description: values.description,
        importance: values.importance,
        expectedCompletionTime: values.expectedCompletionTime,
        deadline: values.deadline,
        identifier: identifier,
        repeat: values.repeat,
        repeatDate:
          values.repeat.slice(-8) != "until..." ? null : values.repeatDate,
      })
      .then(() =>
        Alert.alert("Task Created", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("TaskList"),
          },
        ])
      )
      .catch((err) => console.error(err));
  };

  const handleEditTask = async (values) => {
    if (
      moment().isBefore(
        moment(task.data.deadline, "MMMM Do YYYY, h:mm a").subtract({
          hours: task.data.expectedCompletionTime,
        })
      )
    ) {
      await Notifications.cancelScheduledNotificationAsync(
        tast.data.identifier
      );
    }
    let newIdentifer = await scheduleNotif(
      values.title,
      values.expectedCompletionTime,
      values.deadline
    );
    tasksDb
      .doc(task.key)
      .set({
        title: values.title,
        description: values.description,
        importance: values.importance,
        expectedCompletionTime: values.expectedCompletionTime,
        deadline: values.deadline,
        identifier: newIdentifer,
        repeat: values.repeat,
        repeatDate:
          values.repeat.slice(-8) != "until..." ? null : values.repeatDate,
      })
      .then(() =>
        Alert.alert("Task Edited", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("TaskList"),
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

  const handleShowDatePicker = () => {
    Keyboard.dismiss();
    setShowRepeatPicker(false);
    setShowRepeatDatePicker(false);
    showDatePicker();
  };

  const handleToggleRepeatPicker = () => {
    Keyboard.dismiss();
    hideDatePicker();
    setShowRepeatDatePicker(false);
    setShowRepeatPicker(!showRepeatPicker);
  };

  const toggleRepeatDatePicker = () => {
    Keyboard.dismiss();
    hideDatePicker();
    setShowRepeatPicker(false);
    setShowRepeatDatePicker(true);
  };

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
                  deadline: newRoundedDate(),
                  repeat: "None",
                  repeatDate: today,
                }
              : {
                  title: task.data.title,
                  description: task.data.description,
                  importance: task.data.importance,
                  expectedCompletionTime: task.data.expectedCompletionTime,
                  deadline: task.data.deadline,
                  repeat: task.data.repeat,
                  repeatDate:
                    task.data.repeatDate == null
                      ? new Date(
                          formatDateString(task.data.deadline) +
                            "T00:00:00.000+08:00"
                        )
                      : task.data.repeatDate,
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
                placeholderTextColor="#a2d5f2"
              />
              <Text style={styles.errorText}>
                {" "}
                {touched.title && errors.title}
              </Text>

              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Description (Optional)"
                onChangeText={handleChange("description")}
                value={values.description}
                placeholderTextColor="#a2d5f2"
              />
              <Text style={styles.errorText}> </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Importance (1 - 5)"
                onChangeText={handleChange("importance")}
                value={values.importance}
                keyboardType="numeric"
                onBlur={handleBlur("importance")}
                placeholderTextColor="#a2d5f2"
              />
              <Text style={styles.errorText}>
                {touched.importance && errors.importance}{" "}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Required Time (hours)"
                onChangeText={handleChange("expectedCompletionTime")}
                value={values.expectedCompletionTime}
                keyboardType="numeric"
                onBlur={handleBlur("expectedCompletionTime")}
                placeholderTextColor="#a2d5f2"
              />
              <Text style={styles.errorText}>
                {touched.expectedCompletionTime &&
                  errors.expectedCompletionTime}{" "}
              </Text>
              <View style={styles.topDates}>
                <Text style={styles.dateText}>Deadline: </Text>
                <TouchableOpacity onPress={handleShowDatePicker}>
                  <Text style={styles.touchableText}>
                    {formatDateDisplay(values.deadline)}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="datetime"
                  minuteInterval={15}
                  onConfirm={(deadline) => {
                    setFieldValue("deadline", deadline);
                    hideDatePicker();
                  }}
                  onCancel={hideDatePicker}
                  date={values.deadline}
                />
              </View>
              <View style={styles.dates}>
                <Text style={styles.dateText}>Repeat:</Text>
                <TouchableOpacity onPress={handleToggleRepeatPicker}>
                  <Text style={styles.touchableText}>{values.repeat}</Text>
                </TouchableOpacity>
              </View>
              {values.repeat.slice(-8) == "until..." && (
                <View style={styles.dates}>
                  <Text style={styles.dateText}>Repeat until:</Text>
                  <TouchableOpacity onPress={toggleRepeatDatePicker}>
                    <Text style={styles.touchableText}>
                      {formatDate(values.repeatDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              <DateTimePickerModal
                isVisible={showRepeatDatePicker}
                mode="date"
                onConfirm={(repeatDate) => {
                  setFieldValue("repeatDate", repeatDate);
                  setShowRepeatDatePicker(false);
                }}
                onCancel={() => setShowRepeatDatePicker(false)}
                date={values.repeatDate}
              />
              {showRepeatPicker && (
                <Picker
                  selectedValue={values.repeat}
                  style={{ width: 350 }}
                  onValueChange={(itemValue, itemIndex) =>
                    setFieldValue("repeat", itemValue)
                  }
                >
                  <Picker.Item label="None" value="None" />
                  <Picker.Item label="Daily" value="Daily" />
                  <Picker.Item label="Weekly" value="Weekly" />
                  <Picker.Item label="Monthly" value="Monthly" />
                  <Picker.Item label="Daily until..." value="Daily until..." />
                  <Picker.Item
                    label="Weekly until..."
                    value="Weekly until..."
                  />
                  <Picker.Item
                    label="Monthly until..."
                    value="Monthly until..."
                  />
                </Picker>
              )}
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
    backgroundColor: "#fafafa",
  },
  topDates: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 300,
  },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  textInput: {
    borderWidth: 1.2,
    borderColor: "#07689f",
    fontSize: 20,
    padding: 10,
    width: 300,
    borderRadius: 2,
    color: "#07689f",
    marginTop: 10,
  },
  dateText: {
    fontSize: 18,
    color: "#07689f",
  },
  touchableText: {
    padding: 10,
    fontSize: 18,
    color: "#ff7e67",
  },
  errorText: {
    marginBottom: 0,
    marginTop: 2,
    textAlign: "center",
    fontSize: 14,
    color: "#fb4444",
  },
});
