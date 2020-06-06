import React from "react";
import { View, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const DatePicker = ({ initialDate, onChange, mode }) => (
  <View style={styles.container}>
    <DateTimePicker
      testID="dateTimePicker"
      value={initialDate}
      mode={mode}
      display="default"
      onChange={onChange}
      minuteInterval={5}
    />
  </View>
);

export default DatePicker;

const styles = StyleSheet.create({
  container: {
    width: 1000,
    backgroundColor: "#f9c2ff",
  },
});
