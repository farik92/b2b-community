import moment from "moment";
import "moment-timezone";

export const getDateAndHours = (dateISO: string, type: string) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = moment.utc(dateISO).tz(userTimeZone).format("HH:mm");
  const localDate = moment.utc(dateISO).tz(userTimeZone).format("DD.MM.YY");
  if (type === "date") {
    return localDate;
  } else {
    return `${localDate} в ${localTime}`;
  }
};
