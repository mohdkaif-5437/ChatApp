export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "Unknown Date";
  const date = new Date(timestamp);
  return isNaN(date) ? "Invalid Date" : date.toLocaleString();
};
