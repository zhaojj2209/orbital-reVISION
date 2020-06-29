import moment from "moment";

export const formatTime = (date) => moment(date).format("h:mm A");

export const formatDate = (date) => moment(date).format("dddd, DD MMM");

export const formatDateString = (date) => moment(date).format("YYYY-MM-DD");

export const newRoundedDate = () => {
  const coeff = getMinutes(5);
  const date = new Date();
  return new Date(Math.round(date.getTime() / coeff) * coeff);
};

export const formatDateObject = (date) => {
  return {
    dateString: formatDateString(date),
    day: date.getDate(),
    month: date.getMonth() + 1,
    timestamp: date.getTime(),
    year: date.getFullYear(),
  };
};

export const getMinutes = (mins) => mins * 60 * 1000;

export const getHours = (hrs) => hrs * getMinutes(60);

export const getDays = (days) => days * getHours(24);

export const today = new Date(
  formatDateString(new Date()) + "T00:00:00.000+08:00"
);
